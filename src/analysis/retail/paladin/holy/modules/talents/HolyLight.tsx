import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import CastOverview, { StatisticData } from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import HandOfDivinity from './HandOfDivinity';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

/**
 * Holy Light, and the two talents that decide what a cast of it is worth.
 *
 * Resplendent Light spreads part of each cast to allies near the target, so the number of
 * those heals per cast is how many extra people it reached. Hand of Divinity makes casts
 * instant. Overhealing is the honest measure of whether the cast was needed at all.
 */
class HolyLight extends Analyzer {
  static dependencies = {
    handOfDivinity: HandOfDivinity,
  };

  protected handOfDivinity!: HandOfDivinity;

  casts = 0;
  healing = 0;
  overhealing = 0;

  splashHeals = 0;
  splashHealing = 0;

  private hasResplendentLight = this.selectedCombatant.hasTalent(TALENTS.RESPLENDENT_LIGHT_TALENT);
  private hasHandOfDivinity = this.selectedCombatant.hasTalent(TALENTS.HAND_OF_DIVINITY_TALENT);

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_LIGHT), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_LIGHT), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RESPLENDENT_LIGHT_HEAL),
      this.onSplashHeal,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  onSplashHeal(event: HealEvent) {
    this.splashHeals += 1;
    this.splashHealing += event.amount + (event.absorbed || 0);
  }

  get overhealingPercentage() {
    const raw = this.healing + this.overhealing;
    return raw === 0 ? 0 : this.overhealing / raw;
  }

  /** Extra allies reached per cast, on top of the target you aimed at. */
  get averageSplashTargets() {
    return this.casts === 0 ? 0 : this.splashHeals / this.casts;
  }

  private get explanation() {
    return (
      <>
        <p>
          <SpellLink spell={SPELLS.HOLY_LIGHT} /> is slow and expensive, so a cast you did not need
          costs you more than just the healing it wasted. Overhealing is the clearest sign of that:
          a cast that mostly overhealed was a cast better spent on something else.
        </p>
        {this.hasResplendentLight && (
          <p>
            <SpellLink spell={TALENTS.RESPLENDENT_LIGHT_TALENT} /> spreads part of each cast to
            allies near your target, so how many it reaches depends on who you aim at and how spread
            the raid is. A low average is not automatically a mistake -- healing someone isolated is
            sometimes exactly what is needed.
          </p>
        )}
        {this.hasHandOfDivinity && (
          <p>
            <SpellLink spell={TALENTS.HAND_OF_DIVINITY_TALENT} /> makes casts instant. Spend those
            charges rather than letting them run out.
          </p>
        )}
      </>
    );
  }

  private get stats(): StatisticData[] {
    const stats: StatisticData[] = [
      {
        value: `${this.casts}`,
        label: 'Casts',
        tooltip: (
          <>
            {formatNumber(this.healing)} effective healing from{' '}
            <SpellLink spell={SPELLS.HOLY_LIGHT} /> itself.
          </>
        ),
      },
      {
        value: `${formatPercentage(this.overhealingPercentage, 0)}%`,
        label: 'Overhealing',
        tooltip: (
          <>
            {formatNumber(this.overhealing)} overhealing against {formatNumber(this.healing)}{' '}
            effective. A high share means casts that were not needed.
          </>
        ),
      },
    ];

    if (this.hasResplendentLight) {
      stats.push({
        value: this.averageSplashTargets.toFixed(1),
        label: 'Avg Extra Targets',
        tooltip: (
          <>
            {this.splashHeals} extra allies healed by{' '}
            <SpellLink spell={TALENTS.RESPLENDENT_LIGHT_TALENT} /> across {this.casts} casts, for{' '}
            {formatNumber(this.splashHealing)} healing.
          </>
        ),
      });
    }

    if (this.hasHandOfDivinity) {
      stats.push({
        value: `${this.handOfDivinity.procsUsed} / ${this.handOfDivinity.procsGained}`,
        label: 'Hand of Divinity Procs',
        tooltip: (
          <>
            Charges of <SpellLink spell={TALENTS.HAND_OF_DIVINITY_TALENT} /> spent on an instant{' '}
            <SpellLink spell={SPELLS.HOLY_LIGHT} />, out of those you were granted.{' '}
            {this.handOfDivinity.procsWasted} went unused.
          </>
        ),
      });
    }

    return stats;
  }

  get guideSubsection(): JSX.Element {
    return (
      <GuideSection
        explanation={this.explanation}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
      >
        <CastOverview spell={SPELLS.HOLY_LIGHT} title="Holy Light Overview" stats={this.stats} />
      </GuideSection>
    );
  }
}

export default HolyLight;

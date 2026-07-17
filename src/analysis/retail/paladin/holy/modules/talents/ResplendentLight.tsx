import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

/**
 * Resplendent Light
 *
 * Holy Light also heals allies near its target. The heal is its own spell, so the number
 * of those events per Holy Light cast is how many extra people each cast reached -- which
 * is really a measure of where you stood and who you aimed at.
 */
class ResplendentLight extends Analyzer {
  holyLightCasts = 0;
  splashHeals = 0;
  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RESPLENDENT_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_LIGHT),
      this.onHolyLightCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RESPLENDENT_LIGHT_HEAL),
      this.onSplashHeal,
    );
  }

  onHolyLightCast() {
    this.holyLightCasts += 1;
  }

  onSplashHeal(event: HealEvent) {
    this.splashHeals += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  /** Extra allies reached per Holy Light, on top of the target you actually aimed at. */
  get averageTargetsHealed() {
    return this.holyLightCasts === 0 ? 0 : this.splashHeals / this.holyLightCasts;
  }

  get overhealingPercentage() {
    const raw = this.healing + this.overhealing;
    return raw === 0 ? 0 : this.overhealing / raw;
  }

  private get explanation() {
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.RESPLENDENT_LIGHT_TALENT} /> makes each{' '}
          <SpellLink spell={SPELLS.HOLY_LIGHT} /> also heal allies near its target, so its value
          depends entirely on how many people were standing close enough to be caught.
        </p>
        <p>
          A low average is not automatically a mistake -- healing someone isolated is sometimes
          exactly what is needed. It does tell you whether the talent is paying for itself on this
          fight, or whether the raid was too spread for it to do much.
        </p>
      </>
    );
  }

  private get stats() {
    return [
      {
        value: this.averageTargetsHealed.toFixed(1),
        label: 'Avg Extra Targets',
        tooltip: (
          <>
            {this.splashHeals} extra allies healed across {this.holyLightCasts}{' '}
            <SpellLink spell={SPELLS.HOLY_LIGHT} /> casts, on top of each cast's own target.
          </>
        ),
      },
      {
        value: formatNumber(this.healing),
        label: 'Healing',
        tooltip: (
          <>
            Effective healing done by <SpellLink spell={TALENTS.RESPLENDENT_LIGHT_TALENT} /> itself.
          </>
        ),
      },
      {
        value: `${formatPercentage(this.overhealingPercentage, 0)}%`,
        label: 'Overhealing',
        tooltip: <>{formatNumber(this.overhealing)} overhealing.</>,
      },
    ];
  }

  get guideSubsection(): JSX.Element {
    return (
      <SubSection title="Resplendent Light">
        <GuideSection
          explanation={this.explanation}
          explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        >
          <CastOverview
            spell={TALENTS.RESPLENDENT_LIGHT_TALENT}
            title="Resplendent Light Overview"
            stats={this.stats}
          />
        </GuideSection>
      </SubSection>
    );
  }
}

export default ResplendentLight;

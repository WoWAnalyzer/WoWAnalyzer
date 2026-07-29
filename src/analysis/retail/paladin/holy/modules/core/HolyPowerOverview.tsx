import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import StackedBar, { StackedBarSegment } from 'interface/guide/components/StackedBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';
import { HOLY_POWER_EFFICIENCY_THRESHOLDS } from 'analysis/retail/paladin/shared/HolyPowerDetails';
import HolyPowerTracker from 'analysis/retail/paladin/shared/HolyPowerTracker';
import { SPELL_COLORS } from '../../constants';
import HealingPerHolyPower from '../features/HealingPerHolyPower';
import HolyPowerGraph from './HolyPowerGraph';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

const SPENDER_COLORS: Record<number, string> = {
  [SPELLS.WORD_OF_GLORY.id]: SPELL_COLORS.WORD_OF_GLORY,
  [TALENTS.ETERNAL_FLAME_TALENT.id]: SPELL_COLORS.WORD_OF_GLORY,
  [TALENTS.LIGHT_OF_DAWN_TALENT.id]: SPELL_COLORS.LIGHT_OF_DAWN,
  [SPELLS.SHIELD_OF_THE_RIGHTEOUS_HOLY.id]: SPELL_COLORS.SHIELD_OF_THE_RIGHTEOUS,
};

interface SpenderHealing {
  healing: number;
  overhealing: number;
}

class HolyPowerOverview extends Analyzer {
  static dependencies = {
    holyPowerTracker: HolyPowerTracker,
    healingPerHolyPower: HealingPerHolyPower,
    holyPowerGraph: HolyPowerGraph,
  };

  protected holyPowerTracker!: HolyPowerTracker;
  protected healingPerHolyPower!: HealingPerHolyPower;
  protected holyPowerGraph!: HolyPowerGraph;

  /** Keyed by spell id. Every healing spender casts and heals under the same id. */
  private healingBySpender: Record<number, SpenderHealing> = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(this.healingSpenders),
      this.onSpenderHeal,
    );
  }

  /** Word of Glory (or Eternal Flame) and Light of Dawn both heal under their cast id. */
  private get healingSpenders(): Spell[] {
    return [getWordofGlorySpell(this.selectedCombatant), TALENTS.LIGHT_OF_DAWN_TALENT];
  }

  /** Shield of the Righteous spends Holy Power too, but deals damage rather than healing. */
  private get allSpenders(): Spell[] {
    return [...this.healingSpenders, SPELLS.SHIELD_OF_THE_RIGHTEOUS_HOLY];
  }

  onSpenderHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const entry = (this.healingBySpender[spellId] ??= { healing: 0, overhealing: 0 });
    entry.healing += event.amount + (event.absorbed || 0);
    entry.overhealing += event.overheal || 0;
  }

  get totalHolyPower() {
    return this.holyPowerTracker.generated + this.holyPowerTracker.wasted;
  }

  get wastedPercentage() {
    return this.totalHolyPower === 0 ? 0 : this.holyPowerTracker.wasted / this.totalHolyPower;
  }

  /** The share of Holy Power that made it onto a spender rather than being overcapped. */
  get efficiency() {
    return 1 - this.wastedPercentage;
  }

  get spenderOverhealingPercentage() {
    const totals = Object.values(this.healingBySpender).reduce(
      (sum, entry) => ({
        healing: sum.healing + entry.healing,
        overhealing: sum.overhealing + entry.overhealing,
      }),
      { healing: 0, overhealing: 0 },
    );
    const raw = totals.healing + totals.overhealing;
    return raw === 0 ? 0 : totals.overhealing / raw;
  }

  private get spenderSegments(): StackedBarSegment[] {
    return this.allSpenders
      .map((spell) => ({ spell, spender: this.holyPowerTracker.spendersObj[spell.id] }))
      .filter(({ spender }) => spender && spender.spent > 0)
      .sort((a, b) => b.spender.spent - a.spender.spent)
      .map(({ spell, spender }) => {
        const healed = this.healingBySpender[spell.id];
        const raw = healed ? healed.healing + healed.overhealing : 0;

        return {
          label: spell.name,
          value: spender.spent,
          color: SPENDER_COLORS[spell.id] ?? SPELL_COLORS.WORD_OF_GLORY,
          tooltip: (
            <>
              <div>
                {formatNumber(spender.spent)} <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />{' '}
                spent across {spender.casts} <SpellLink spell={spell} /> casts
              </div>
              {healed ? (
                <div>
                  {formatNumber(healed.healing)} healing,{' '}
                  {formatPercentage(healed.overhealing / raw)}% overheal
                </div>
              ) : (
                <div>Deals damage rather than healing.</div>
              )}
            </>
          ),
        };
      });
  }

  private get explanation() {
    const spender = getWordofGlorySpell(this.selectedCombatant);

    return (
      <>
        <p>
          Since <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> spenders are so impactful,
          minimizing waste should be a priority. <SpellLink spell={spender} /> is often the most
          reliable choice when deciding which <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />{' '}
          spender to use. As a general rule of thumb, if casting <SpellLink spell={spender} /> won't
          result in significant overhealing, it's usually the best option. This is because{' '}
          <SpellLink spell={TALENTS.LIGHT_OF_DAWN_TALENT} /> tends to overheal and targets allies
          randomly, making it less effective.
        </p>
        <p>
          When using <SpellLink spell={spender} />, try to avoid targeting your Beaconed allies
          unless they are in immediate danger of dying. If there is no healing needed, don't
          hesitate to use <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> to avoid capping on{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
        </p>
      </>
    );
  }

  private get stats() {
    const performance = evaluateQualitativePerformanceByThreshold({
      actual: this.efficiency,
      isGreaterThanOrEqual: HOLY_POWER_EFFICIENCY_THRESHOLDS,
    });

    return [
      {
        value: formatNumber(this.holyPowerTracker.wasted),
        label: 'Holy Power Wasted',
        tooltip: (
          <>
            {formatPercentage(this.wastedPercentage)}% of the {formatNumber(this.totalHolyPower)}{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> you generated was overcapped and
            lost.
          </>
        ),
        performance,
      },
      {
        value: formatNumber(this.holyPowerTracker.spent),
        label: 'Holy Power Spent',
        tooltip: (
          <>
            Total <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> spent across{' '}
            {formatNumber(this.healingPerHolyPower.totalSpenders)} spenders.
          </>
        ),
      },
      {
        value: formatNumber(this.healingPerHolyPower.averageHealingPerHolyPower),
        label: 'Healing per Holy Power',
        tooltip: (
          <>
            Healing done by your spenders, divided by the{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> they cost.
          </>
        ),
      },
      {
        value: `${formatPercentage(this.spenderOverhealingPercentage, 0)}%`,
        label: 'Spender Overhealing',
        tooltip: <>Overhealing across all of your healing spenders combined.</>,
      },
    ];
  }

  get guideSubsection(): JSX.Element {
    return (
      <GuideSection
        explanation={this.explanation}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
      >
        <CastOverview
          // Only used as a fallback title, which the explicit title below replaces.
          spell={getWordofGlorySpell(this.selectedCombatant)}
          title="Holy Power Overview"
          stats={this.stats}
          additionalContent={{
            title: 'Holy Power Spent By Spell',
            content: <StackedBar segments={this.spenderSegments} />,
          }}
        />
        {this.holyPowerGraph.plot}
      </GuideSection>
    );
  }
}

export default HolyPowerOverview;

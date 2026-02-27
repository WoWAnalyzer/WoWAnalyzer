import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { abilityToSpell } from 'common/abilityToSpell';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { Attribution } from 'parser/shared/modules/HotTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS } from 'analysis/retail/druid/restoration/constants';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Rejuvenation from 'analysis/retail/druid/restoration/modules/spells/Rejuvenation';
import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

const ALL_BOOST = 0.1;
const ALL_MULT = 1 + ALL_BOOST;
const REJUV_BOOST = 0.4;
const WG_BASE_TARGETS = 5;
const IMPROVED_WG_EXTRA_TARGETS = 2; // TODO: add module for improved wg
const TOL_EXTRA_WG_TARGETS = 2;
const TOL_DURATION = 30000;
const BUFFER = 500;
const REJUV_RAMP_WINDOW = 15_000;

const GOOD_REJUV_ACTIVE_THRESHOLD = 0.55;
const OK_REJUV_ACTIVE_THRESHOLD = 0.4;
const GOOD_OVERALL_ACTIVE_THRESHOLD = 0.9;
const OK_OVERALL_ACTIVE_THRESHOLD = 0.7;

const REJUV_SPELL_IDS = [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id];

// have to be careful about applying stacking boosts so we don't double count. Arbitrarily considering all boost to be applied "first"
// for example, lets say a rejuv tick during ToL heals for 1000 base, but is boosted by 1.15 * 1.5 => 1725... a total of 725 raw boost
// if we count each as a seperate boost, we get 1.15 => 225 boost, 1.5 => 575, total of 800 ... the overlapping boost was double counted
// we correct for this by dividing out the all boost before calcing either the rejuv boost or the wg increase

/**
 * **Incarnation: Tree of Life**
 * Spec Talent Tier 8
 *
 * Shapeshift into the Tree of Life, increasing healing done by 15%, increasing armor by 120%,
 * and granting protection from Polymorph effects.
 * Functionality of Rejuvenation, Wild Growth, Regrowth, Entangling Roots, and Wrath is enhanced.
 * Lasts 30 sec. You may shapeshift in and out of this form for its duration.
 *
 * Tree of Life healing bonuses:
 *  - ALL: +10% healing
 *  - Rejuv: +40% healing and -30% mana
 *  - Regrowth: instant
 *  - Wild Growth: +2 targets
 *  - Wrath: Instant cast and 20% increased damage
 */
class TreeOfLife extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    abilityTracker: AbilityTracker,
    rejuvenation: Rejuvenation,
    hotTracker: HotTrackerRestoDruid,
    alwaysBeCasting: AlwaysBeCasting,
  };

  healingDone!: HealingDone;
  abilityTracker!: AbilityTracker;
  rejuvenation!: Rejuvenation;
  hotTracker!: HotTrackerRestoDruid;
  alwaysBeCasting!: AlwaysBeCasting;

  lastHardcastTimestamp: number | null = null;
  wgIncrease: number;

  hardcast: TolAccumulator = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution('ToL Hardcast: Extra WGs'),
  };
  reforestation: TolAccumulator = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution(
      'ToL from Reforestation: Extra WGs',
    ),
  };
  hardcastTrackers: TreeOfLifeCast[] = [];

  constructor(options: Options) {
    super(options);

    const improvedWildGrowthExtraTargets = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.IMPROVED_WILD_GROWTH_TALENT,
    )
      ? IMPROVED_WG_EXTRA_TARGETS
      : 0;
    const wildGrowthTargets = WG_BASE_TARGETS + improvedWildGrowthExtraTargets;
    this.wgIncrease = (wildGrowthTargets + TOL_EXTRA_WG_TARGETS) / wildGrowthTargets - 1;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS),
      this.onBoostedHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT),
      this.onHardcastTol,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onApplyTol,
    );

    this.addEventListener(Events.fightend, this.checkActive);
  }

  checkActive() {
    // only stay active for suggestion / stat if player actually has Talent -
    // we need this to calc to check for reforestation, which is why we don't check active at the start
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT);
  }

  onHardcastTol(event: CastEvent) {
    this.lastHardcastTimestamp = event.timestamp;

    this.hardcastTrackers.push({
      timestamp: event.timestamp,
      accumulator: {
        allBoostHealing: 0,
        rejuvBoostHealing: 0,
        extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution(
          `ToL Hardcast #${this.hardcastTrackers.length + 1}: Extra WGs`,
        ),
      },
      casts: [],
    });
  }

  onApplyTol(event: ApplyBuffEvent) {
    if (isFromHardcast(event)) {
      this.lastHardcastTimestamp = event.timestamp; // set here and on cast to avoid event ordering mishaps
    }
  }

  onCast(event: CastEvent) {
    if (
      event.ability.guid === TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id ||
      CASTS_THAT_ARENT_CASTS.includes(event.ability.guid)
    ) {
      return;
    }

    const hardcastTracker = this.getHardcastTrackerAt(event.timestamp);
    if (hardcastTracker) {
      hardcastTracker.casts.push(event);
    }
  }

  /**
   * Gets the tracking accumulator for the current ToL, if there is one
   */
  _getAccumulator(event: AnyEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      return null; // ToL isn't active, no accumulator
    } else if (!this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT)) {
      return this.reforestation; // player doesn't have the ToL talent so this must be from reforestation proc
    } else if (
      this.lastHardcastTimestamp !== null &&
      this.lastHardcastTimestamp + TOL_DURATION + BUFFER >= event.timestamp
    ) {
      return this.hardcast; // player hardcast ToL within buff duration, so this is a hardcast
    } else {
      return this.reforestation; // player didn't hardcast within buff duration, so this is reforestation proc
    }
  }

  onBoostedHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    const hardcastTracker = this.getHardcastTrackerAt(event.timestamp);

    accumulator.allBoostHealing += calculateEffectiveHealing(event, ALL_BOOST);
    if (hardcastTracker) {
      hardcastTracker.accumulator.allBoostHealing += calculateEffectiveHealing(event, ALL_BOOST);
    }

    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      accumulator.rejuvBoostHealing += calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT;
      if (hardcastTracker) {
        hardcastTracker.accumulator.rejuvBoostHealing +=
          calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT;
      }
    }
  }

  onApplyWildGrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    const hardcastTracker = this.getHardcastTrackerAt(event.timestamp);
    // ToL causes extra WG buffs to be applied - rather than arbitrarily deciding which HoTs
    // were the "extra" ones, we instead partially attribute every WG applied during ToL
    this.hotTracker.addBoostFromApply(
      accumulator.extraWgsAttribution,
      this.wgIncrease / ALL_MULT,
      event,
    );
    if (hardcastTracker) {
      this.hotTracker.addBoostFromApply(
        hardcastTracker.accumulator.extraWgsAttribution,
        this.wgIncrease / ALL_MULT,
        event,
      );
    }
  }

  getHardcastTrackerAt(timestamp: number): TreeOfLifeCast | undefined {
    return this.hardcastTrackers.find(
      (tracker) =>
        tracker.timestamp <= timestamp && tracker.timestamp + TOL_DURATION + BUFFER >= timestamp,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this._getTotalHealing(this.hardcast)),
      isLessThan: {
        minor: 0.06,
        average: 0.045,
        major: 0.025,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _getTotalHealing(accumulator: TolAccumulator) {
    return (
      accumulator.allBoostHealing +
      accumulator.rejuvBoostHealing +
      accumulator.extraWgsAttribution.healing
    );
  }

  // TODO implement (what do we need?)
  /** Guide fragment showing a breakdown of each Incarnation: Tree of Life cast */
  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} />
        </strong>{' '}
        should generally be used 10-12 seconds before major damage hits so you can maximize the
        mana discount on <SpellLink spell={SPELLS.REJUVENATION} /> during your ramp. While
        Incarnation is active, you can otherwise continue your standard rotation. Its duration is
        paused while channeling <SpellLink spell={SPELLS.TRANQUILITY_CAST} />, so combining the two
        is usually a good idea. Be careful not to overvalue the Regrowth bonus: making{' '}
        <SpellLink spell={SPELLS.REGROWTH} /> instant mostly front-loads the heal, since its normal
        cast time is already equal to the global cooldown.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.hardcastTrackers.map((cast, ix) => {
          const castTotalHealing = this._getTotalHealing(cast.accumulator);
          const treeEnd = Math.min(this.owner.fight.end_time, cast.timestamp + TOL_DURATION);
          const treeDuration = treeEnd - cast.timestamp;
          const rejuvRampEnd = Math.min(this.owner.fight.end_time, cast.timestamp + REJUV_RAMP_WINDOW);
          const rejuvRampDuration = rejuvRampEnd - cast.timestamp;

          const rejuvActiveTime = this.alwaysBeCasting.getActiveTimeMillisecondsFiltered(
            cast.timestamp,
            rejuvRampEnd,
            REJUV_SPELL_IDS,
          );
          const overallActiveTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
            cast.timestamp,
            treeEnd,
          );

          const rejuvActivePercent = rejuvRampDuration <= 0 ? 0 : rejuvActiveTime / rejuvRampDuration;
          const overallActivePercent = treeDuration <= 0 ? 0 : overallActiveTime / treeDuration;

          const rejuvRampPerf = evaluateQualitativePerformanceByThreshold({
            actual: rejuvActivePercent,
            isGreaterThanOrEqual: {
              good: GOOD_REJUV_ACTIVE_THRESHOLD,
              ok: OK_REJUV_ACTIVE_THRESHOLD,
            },
          });

          const overallActivePerf = evaluateQualitativePerformanceByThreshold({
            actual: overallActivePercent,
            isGreaterThanOrEqual: {
              good: GOOD_OVERALL_ACTIVE_THRESHOLD,
              ok: OK_OVERALL_ACTIVE_THRESHOLD,
            },
          });

          const overallPerf = combineQualitativePerformances([rejuvRampPerf, overallActivePerf]);

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} /> ({formatNumber(castTotalHealing)}{' '}
              healing)
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: 'Rejuvenation ramp activity in first 15s',
            result: <PerformanceMark perf={rejuvRampPerf} />,
            details: <>({formatPercentage(rejuvActivePercent, 0)}% active Rejuvenation time)</>,
          });
          checklistItems.push({
            label: 'Overall active GCD usage during Tree',
            result: <PerformanceMark perf={overallActivePerf} />,
            details: <>({formatPercentage(overallActivePercent, 0)}% active time)</>,
          });

          const detailItems: CooldownExpandableItem[] = [];
          detailItems.push({
            label: 'Total Healing',
            result: '',
            details: <>{formatNumber(castTotalHealing)}</>,
          });
          detailItems.push({
            label: 'All-Healing Bonus Contribution',
            result: '',
            details: <>{formatNumber(cast.accumulator.allBoostHealing)}</>,
          });
          detailItems.push({
            label: 'Rejuvenation Bonus Healing',
            result: '',
            details: <>{formatNumber(cast.accumulator.rejuvBoostHealing)}</>,
          });
          detailItems.push({
            label: 'Wild Growth Extra-Target Contribution',
            result: '',
            details: <>{formatNumber(cast.accumulator.extraWgsAttribution.healing)}</>,
          });
          detailItems.push({
            label: 'Casts during Tree',
            result: '',
            details: cast.casts.map((castEvent, castIndex) => (
              <span key={castIndex}>
                <SpellIcon spell={abilityToSpell(castEvent.ability)} />{' '}
              </span>
            )),
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              detailItems={detailItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            The displayed healing number is the sum of several benefits, listed below:
            <ul>
              <li>
                Overall Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.allBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.rejuvBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Increased Wild Growths:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.hardcast.extraWgsAttribution.healing,
                    ),
                  )}
                  %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT}>
          <ItemPercentHealingDone amount={this._getTotalHealing(this.hardcast)} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

// data shuttle for keeping track of bonuses attributed to ToL
interface TolAccumulator {
  allBoostHealing: number;
  rejuvBoostHealing: number;
  extraWgsAttribution: Attribution;
}

interface TreeOfLifeCast {
  timestamp: number;
  accumulator: TolAccumulator;
  casts: CastEvent[];
}

export default TreeOfLife;

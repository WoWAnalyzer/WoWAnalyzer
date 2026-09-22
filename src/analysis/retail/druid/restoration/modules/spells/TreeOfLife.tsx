import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { abilityToSpell } from 'common/abilityToSpell';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { Attribution } from 'parser/shared/modules/HotTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import ManaValues from 'parser/shared/modules/ManaValues';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES_SPELL_OBJECTS } from 'analysis/retail/druid/restoration/constants';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Rejuvenation from 'analysis/retail/druid/restoration/modules/spells/Rejuvenation';
import {
  isFromHardcast,
  isFromTreeOfLifeCast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

const ALL_BOOST = 0.1;
const ALL_MULT = 1 + ALL_BOOST;
const REJUV_BOOST = 0.4;
export const TOL_REJUVENATION_MANA_REDUCTION = 0.3;
const WG_BASE_TARGETS = 5;
const IMPROVED_WG_EXTRA_TARGETS = 2;
const TOL_EXTRA_WG_TARGETS = 2;
const TOL_DURATION = 30000;
const BUFFER = 500;
const REJUV_RAMP_WINDOW = 15_000;
const POTENT_ENCHANTMENTS_DURATION_INCREASE = 6000; // ms

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
    manaValues: ManaValues,
  };

  healingDone!: HealingDone;
  abilityTracker!: AbilityTracker;
  rejuvenation!: Rejuvenation;
  hotTracker!: HotTrackerRestoDruid;
  alwaysBeCasting!: AlwaysBeCasting;
  manaValues!: ManaValues;

  lastHardcastTimestamp: number | null = null;
  wgIncrease: number;

  hardcast: TolAccumulator = {
    allBoostHealing: 0,
    allBoostOverhealing: 0,
    rejuvBoostHealing: 0,
    rejuvBoostOverhealing: 0,
    freeRegrowthHealing: 0,
    freeRegrowthOverhealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution('ToL Hardcast: Extra WGs'),
    rejuvManaSaved: 0,
  };
  reforestation: TolAccumulator = {
    allBoostHealing: 0,
    allBoostOverhealing: 0,
    rejuvBoostHealing: 0,
    rejuvBoostOverhealing: 0,
    freeRegrowthHealing: 0,
    freeRegrowthOverhealing: 0,
    extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution(
      'ToL from Reforestation: Extra WGs',
    ),
    rejuvManaSaved: 0,
  };
  hardcastTrackers: TreeOfLifeCast[] = [];
  potentEnchantmentsHealing = 0;
  potentEnchantmentsOverhealing = 0;
  activeReforestationChain: ReforestationChain | null = null;

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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION),
      this.onRejuvenationCast,
    );
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
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onApplyTol,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED),
      this.onTolExpired,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
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
        allBoostOverhealing: 0,
        rejuvBoostHealing: 0,
        rejuvBoostOverhealing: 0,
        freeRegrowthHealing: 0,
        freeRegrowthOverhealing: 0,
        extraWgsAttribution: HotTrackerRestoDruid.getNewAttribution(
          `ToL Hardcast #${this.hardcastTrackers.length + 1}: Extra WGs`,
        ),
        rejuvManaSaved: 0,
      },
      casts: [],
      freeRegrowthHeals: [],
    });
  }

  onApplyTol(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromHardcast(event)) {
      this.lastHardcastTimestamp = event.timestamp; // set here and on cast to avoid event ordering mishaps
      return;
    }

    if (this.activeReforestationChain) {
      this.activeReforestationChain.procCount += 1;
    } else {
      this.activeReforestationChain = {
        procCount: 1,
        healingEvents: [],
      };
    }
  }

  onTolExpired(event: RemoveBuffEvent) {
    this.finalizeReforestationChain(event.timestamp);
  }

  onFightEnd(event: AnyEvent) {
    this.checkActive();
    this.finalizeReforestationChain(event.timestamp);
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

  onRejuvenationCast(event: CastEvent) {
    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    const manaSaved = this._getRejuvManaSaved(event);
    if (manaSaved <= 0) {
      return;
    }

    accumulator.rejuvManaSaved += manaSaved;
    const hardcastTracker = this.getHardcastTrackerAt(event.timestamp);
    if (hardcastTracker) {
      hardcastTracker.accumulator.rejuvManaSaved += manaSaved;
    }
  }

  _getRejuvManaSaved(event: CastEvent): number {
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp)) {
      return 0;
    }
    const rawManaCost = event.rawResourceCost?.[RESOURCE_TYPES.MANA.id] ?? 0;
    if (rawManaCost <= 0 || event.resourceCost?.[RESOURCE_TYPES.MANA.id] === 0) {
      return 0;
    }
    return rawManaCost * TOL_REJUVENATION_MANA_REDUCTION;
  }

  /**
   * Gets the tracking accumulator for the current ToL, if there is one
   */
  _getAccumulator(event: AnyEvent) {
    if (event.type === EventType.Heal && isFromTreeOfLifeCast(event)) {
      return this.hardcast;
    }

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
    const isTreeOfLifeRegrowth = spellId === SPELLS.REGROWTH.id && isFromTreeOfLifeCast(event);

    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    const hardcastTracker = this.getHardcastTrackerAt(event.timestamp);

    if (isTreeOfLifeRegrowth) {
      const regrowthHealing = event.amount + (event.absorbed || 0);
      const regrowthOverhealing = event.overheal || 0;
      accumulator.freeRegrowthHealing += regrowthHealing;
      accumulator.freeRegrowthOverhealing += regrowthOverhealing;
      if (hardcastTracker) {
        hardcastTracker.accumulator.freeRegrowthHealing += regrowthHealing;
        hardcastTracker.accumulator.freeRegrowthOverhealing += regrowthOverhealing;
        hardcastTracker.freeRegrowthHeals.push(event);
      }
      return;
    }

    const allBoostHealing = calculateEffectiveHealing(event, ALL_BOOST);
    const allBoostOverhealing = calculateOverhealing(event, ALL_BOOST);

    accumulator.allBoostHealing += allBoostHealing;
    accumulator.allBoostOverhealing += allBoostOverhealing;
    if (hardcastTracker) {
      hardcastTracker.accumulator.allBoostHealing += allBoostHealing;
      hardcastTracker.accumulator.allBoostOverhealing += allBoostOverhealing;
    }

    let rejuvBoostHealing = 0;
    let rejuvBoostOverhealing = 0;
    let extraWgsHealing = 0;
    let extraWgsOverhealing = 0;

    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      rejuvBoostHealing = calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT;
      rejuvBoostOverhealing = calculateOverhealing(event, REJUV_BOOST) / ALL_MULT;
      accumulator.rejuvBoostHealing += rejuvBoostHealing;
      accumulator.rejuvBoostOverhealing += rejuvBoostOverhealing;
      if (hardcastTracker) {
        hardcastTracker.accumulator.rejuvBoostHealing += rejuvBoostHealing;
        hardcastTracker.accumulator.rejuvBoostOverhealing += rejuvBoostOverhealing;
      }
    }

    if (spellId === SPELLS.WILD_GROWTH.id) {
      extraWgsHealing = calculateEffectiveHealing(event, this.wgIncrease / ALL_MULT);
      extraWgsOverhealing = calculateOverhealing(event, this.wgIncrease / ALL_MULT);
    }

    if (accumulator === this.reforestation && this.activeReforestationChain) {
      this.activeReforestationChain.healingEvents.push({
        timestamp: event.timestamp,
        allBoostHealing,
        allBoostOverhealing,
        rejuvBoostHealing,
        rejuvBoostOverhealing,
        extraWgsHealing,
        extraWgsOverhealing,
      });
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

  finalizeReforestationChain(windowEndTimestamp: number) {
    if (!this.activeReforestationChain || this.activeReforestationChain.procCount < 1) {
      this.activeReforestationChain = null;
      return;
    }

    const potentWindowDuration =
      POTENT_ENCHANTMENTS_DURATION_INCREASE * this.activeReforestationChain.procCount;
    const potentWindowStart = windowEndTimestamp - potentWindowDuration;

    this.activeReforestationChain.healingEvents.forEach((healingEvent) => {
      if (
        healingEvent.timestamp >= potentWindowStart &&
        healingEvent.timestamp <= windowEndTimestamp
      ) {
        this.potentEnchantmentsHealing +=
          healingEvent.allBoostHealing +
          healingEvent.rejuvBoostHealing +
          healingEvent.extraWgsHealing;
        this.potentEnchantmentsOverhealing +=
          healingEvent.allBoostOverhealing +
          healingEvent.rejuvBoostOverhealing +
          healingEvent.extraWgsOverhealing;
      }
    });

    this.activeReforestationChain = null;
  }

  getPotentEnchantmentsHealing() {
    return this.potentEnchantmentsHealing;
  }

  getPotentEnchantmentsOverhealing() {
    return this.potentEnchantmentsOverhealing;
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
      accumulator.freeRegrowthHealing +
      accumulator.extraWgsAttribution.healing
    );
  }

  _getTotalOverhealing(accumulator: TolAccumulator) {
    return (
      accumulator.allBoostOverhealing +
      accumulator.rejuvBoostOverhealing +
      accumulator.freeRegrowthOverhealing +
      accumulator.extraWgsAttribution.overheal
    );
  }

  /** Guide fragment showing a breakdown of each Incarnation: Tree of Life cast */
  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} />
        </strong>{' '}
        should generally be combined with <SpellLink spell={SPELLS.TRANQUILITY_CAST} />, since
        channeling Tranquility pauses the remaining duration of your Tree buff. While Incarnation is
        active, keep doing your standard rotation (Abundance Rejuvenations, then Regrowth). Be
        careful not to overvalue the Regrowth bonus: making <SpellLink spell={SPELLS.REGROWTH} />{' '}
        instant mostly front-loads the heal, since its normal cast time is already equal to the
        global cooldown.
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
          const rejuvRampEnd = Math.min(
            this.owner.fight.end_time,
            cast.timestamp + REJUV_RAMP_WINDOW,
          );
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

          const rejuvActivePercent =
            rejuvRampDuration <= 0 ? 0 : rejuvActiveTime / rejuvRampDuration;
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
              <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} /> (
              {formatNumber(castTotalHealing)} healing)
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
            label: 'Free Regrowth Healing',
            result: '',
            details: <>{formatNumber(cast.accumulator.freeRegrowthHealing)}</>,
          });
          detailItems.push({
            label: 'Wild Growth Extra-Target Contribution',
            result: '',
            details: <>{formatNumber(cast.accumulator.extraWgsAttribution.healing)}</>,
          });
          if (cast.freeRegrowthHeals.length > 0) {
            detailItems.push({
              label: 'Free Regrowths',
              result: '',
              details: cast.freeRegrowthHeals.map((healEvent, healIndex) => (
                <span key={healIndex}>
                  <SpellIcon spell={abilityToSpell(healEvent.ability)} />{' '}
                </span>
              )),
            });
          }
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
                </strong>{' '}
                ({formatNumber(this.hardcast.allBoostHealing)})
              </li>
              <li>
                Rejuv Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.rejuvBoostHealing),
                  )}
                  %
                </strong>{' '}
                ({formatNumber(this.hardcast.rejuvBoostHealing)})
              </li>
              <li>
                Free Regrowth Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.hardcast.freeRegrowthHealing),
                  )}
                  %
                </strong>{' '}
                ({formatNumber(this.hardcast.freeRegrowthHealing)})
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
                </strong>{' '}
                ({formatNumber(this.hardcast.extraWgsAttribution.healing)})
              </li>
              <li>
                Rejuvenation mana saved:{' '}
                <strong>{this.manaValues.formatManaSaved(this.hardcast.rejuvManaSaved)}</strong>
              </li>
            </ul>
            <strong>
              Overhealing:{' '}
              {formatOverhealing(
                this._getTotalOverhealing(this.hardcast),
                this._getTotalHealing(this.hardcast),
              )}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT}>
          <ItemPercentHealingDone amount={this._getTotalHealing(this.hardcast)} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

// data shuttle for keeping track of bonuses attributed to ToL
interface TolAccumulator {
  allBoostHealing: number;
  allBoostOverhealing: number;
  rejuvBoostHealing: number;
  rejuvBoostOverhealing: number;
  freeRegrowthHealing: number;
  freeRegrowthOverhealing: number;
  extraWgsAttribution: Attribution;
  rejuvManaSaved: number;
}

interface TreeOfLifeCast {
  timestamp: number;
  accumulator: TolAccumulator;
  casts: CastEvent[];
  freeRegrowthHeals: HealEvent[];
}

interface ReforestationHealingEvent {
  timestamp: number;
  allBoostHealing: number;
  allBoostOverhealing: number;
  rejuvBoostHealing: number;
  rejuvBoostOverhealing: number;
  extraWgsHealing: number;
  extraWgsOverhealing: number;
}

interface ReforestationChain {
  procCount: number;
  healingEvents: ReforestationHealingEvent[];
}

export default TreeOfLife;

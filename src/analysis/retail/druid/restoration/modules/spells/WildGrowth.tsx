import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, EventType, HealEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import HealingValue from 'parser/shared/modules/HealingValue';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import ManaValues from 'parser/shared/modules/ManaValues';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';

import { getHeals } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';
import { TipBox } from 'interface/guide/components';

const WG_BASE_TARGETS = 5;
const IMPROVED_WG_EXTRA_TARGETS = 2;
const TOL_EXTRA_WG_TARGETS = 2;

/** Max time after WG apply to measure early overhealing */
const OVERHEAL_BUFFER = 3000;
/** Early overheal thresholds for the Early Overheal stat (and Perfect cast grade) */
const PERFECT_OVERHEAL_THRESHOLD = 0.1;
const GOOD_OVERHEAL_THRESHOLD = 0.4;
const OK_OVERHEAL_THRESHOLD = 0.7;

interface WgCastRecord {
  timestamp: number;
  performance: QualitativePerformance;
  hits: number;
  expectedTargets: number;
  earlyOverhealPct: number;
  /** Effective healing from this hardcast's HoTs (until next WG / fight end) */
  healing: number;
  duringTreeOfLife: boolean;
  beforeCooldown: boolean;
  cooldownSpellId?: number;
  manaCost: number;
}

/**
 * Tracks Wild Growth cast quality: target count, early overheal, Tranq/Convoke pairing,
 * and (on boss kills) leftover mana that could have funded extra casts.
 */
class WildGrowth extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    manaValues: ManaValues,
  };

  hotTracker!: HotTrackerRestoDruid;
  manaValues!: ManaValues;

  hasImprovedWildGrowth: boolean;
  hasTreeOfLife: boolean;
  hasGroveGuardians: boolean;
  hasTranquility: boolean;
  hasConvoke: boolean;

  recentWgTimestamp = 0;
  recentExpectedTargets = WG_BASE_TARGETS;
  recentDuringToL = false;
  recentManaCost = 0;
  recentBeforeCooldown = false;
  recentCooldownSpellId: number | undefined = undefined;
  /** True while a hardcast WG window is open and waiting to be tallied */
  castInProgress = false;
  /** Tracker for healing on targets hit by a recent hardcast Wild Growth */
  recentWgTargetHealing: Record<
    number,
    {
      appliedTimestamp: number;
      earlyTotal: number;
      earlyOverheal: number;
      healing: number;
    }
  > = {};

  casts: WgCastRecord[] = [];

  /** Total Wild Growth HoTs applied by hardcasts */
  totalHardcastHits = 0;
  /** Total Wild Growth HoTs that did not overheal too much early */
  totalEffectiveHits = 0;

  constructor(options: Options) {
    super(options);

    this.hasImprovedWildGrowth = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.IMPROVED_WILD_GROWTH_TALENT,
    );
    this.hasTreeOfLife = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT,
    );
    this.hasGroveGuardians = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasTranquility = this.selectedCombatant.hasTalent(TALENTS_DRUID.TRANQUILITY_TALENT);
    this.hasConvoke = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onCastWg);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH), this.onHealWg);

    if (this.hasTranquility) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_CAST),
        this.onHealingCooldown,
      );
    }
    if (this.hasConvoke) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
        this.onHealingCooldown,
      );
    }

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private expectedTargetsAt(timestamp: number): number {
    let expected = WG_BASE_TARGETS;
    if (this.hasImprovedWildGrowth) {
      expected += IMPROVED_WG_EXTRA_TARGETS;
    }
    if (
      this.hasTreeOfLife &&
      this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id, timestamp)
    ) {
      expected += TOL_EXTRA_WG_TARGETS;
    }
    return expected;
  }

  private getManaCost(event: CastEvent): number {
    if (event.resourceCost?.[RESOURCE_TYPES.MANA.id] !== undefined) {
      return event.resourceCost[RESOURCE_TYPES.MANA.id];
    }
    const manaResource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    return manaResource?.cost ?? 0;
  }

  onFightEnd() {
    this.tallyLastCast();
  }

  onCastWg(event: CastEvent) {
    this.tallyLastCast();
    this.trackNewCast(event);
  }

  onHealWg(event: HealEvent) {
    const tracker = this.recentWgTargetHealing[event.targetID];
    if (tracker === undefined) {
      return;
    }
    const healVal = HealingValue.fromEvent(event);
    tracker.healing += healVal.effective;
    // Early window is only used for overheal context, not cast pass/fail
    if (event.timestamp <= tracker.appliedTimestamp + OVERHEAL_BUFFER) {
      tracker.earlyTotal += healVal.raw;
      tracker.earlyOverheal += healVal.overheal;
    }
  }

  onHealingCooldown(event: CastEvent) {
    // Most common case: WG was just cast and hasn't been tallied yet
    if (this.castInProgress) {
      this.recentBeforeCooldown = true;
      this.recentCooldownSpellId = event.ability.guid;
      return;
    }

    // Earlier WG whose HoT is still up when Tranq/Convoke is pressed
    if (this.casts.length === 0 || this.hotTracker.getHotCount(SPELLS.WILD_GROWTH.id) <= 0) {
      return;
    }
    const lastCast = this.casts[this.casts.length - 1];
    lastCast.beforeCooldown = true;
    lastCast.cooldownSpellId = event.ability.guid;
    lastCast.performance = this.scoreCast(lastCast);
  }

  private trackNewCast(event: CastEvent) {
    this.recentWgTargetHealing = {};
    this.recentWgTimestamp = event.timestamp;
    this.recentExpectedTargets = this.expectedTargetsAt(event.timestamp);
    this.recentDuringToL =
      this.hasTreeOfLife &&
      this.selectedCombatant.hasBuff(
        TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
        event.timestamp,
      );
    this.recentManaCost = this.getManaCost(event);
    this.recentBeforeCooldown = false;
    this.recentCooldownSpellId = undefined;
    this.castInProgress = true;

    getHeals(event).forEach((applyHot: AnyEvent) => {
      if (applyHot.type === EventType.ApplyBuff || applyHot.type === EventType.RefreshBuff) {
        this.recentWgTargetHealing[applyHot.targetID] = {
          appliedTimestamp: applyHot.timestamp,
          earlyTotal: 0,
          earlyOverheal: 0,
          healing: 0,
        };
      }
    });
  }

  private tallyLastCast() {
    if (!this.castInProgress) {
      return;
    }

    const hits = Object.values(this.recentWgTargetHealing);
    const hitCount = hits.length;
    const rawEarly = hits.reduce((sum, h) => sum + h.earlyTotal, 0);
    const overhealEarly = hits.reduce((sum, h) => sum + h.earlyOverheal, 0);
    const earlyOverhealPct = rawEarly > 0 ? overhealEarly / rawEarly : 0;
    const healing = hits.reduce((sum, h) => sum + h.healing, 0);

    const effectiveHits = hits.filter(
      (wg) => wg.earlyTotal > 0 && wg.earlyOverheal / wg.earlyTotal < GOOD_OVERHEAL_THRESHOLD,
    ).length;
    this.totalHardcastHits += hitCount;
    this.totalEffectiveHits += effectiveHits;

    const record: WgCastRecord = {
      timestamp: this.recentWgTimestamp,
      hits: hitCount,
      expectedTargets: this.recentExpectedTargets,
      earlyOverhealPct,
      healing,
      duringTreeOfLife: this.recentDuringToL,
      beforeCooldown: this.recentBeforeCooldown,
      cooldownSpellId: this.recentCooldownSpellId,
      manaCost: this.recentManaCost,
      performance: QualitativePerformance.Fail,
    };
    record.performance = this.scoreCast(record);
    this.casts.push(record);

    this.castInProgress = false;
    this.recentWgTargetHealing = {};
    this.recentBeforeCooldown = false;
    this.recentCooldownSpellId = undefined;
  }

  private scoreCast(
    cast: Pick<WgCastRecord, 'hits' | 'expectedTargets' | 'earlyOverhealPct' | 'beforeCooldown'>,
  ): QualitativePerformance {
    const missed = Math.max(0, cast.expectedTargets - cast.hits);

    // Missing targets is the only real failure mode — high overheal is often unavoidable
    if (missed > 1) {
      return QualitativePerformance.Fail;
    }
    if (missed === 1) {
      return QualitativePerformance.Ok;
    }

    // Full targets — low early overheal (or pre-CD setup) is Perfect; otherwise Good
    if (cast.earlyOverhealPct < PERFECT_OVERHEAL_THRESHOLD || cast.beforeCooldown) {
      return QualitativePerformance.Perfect;
    }
    return QualitativePerformance.Good;
  }

  get averageEffectiveHits() {
    return this.casts.length === 0 ? 0 : this.totalEffectiveHits / this.casts.length;
  }

  get averageHits() {
    return this.casts.length === 0
      ? 0
      : this.casts.reduce((sum, c) => sum + c.hits, 0) / this.casts.length;
  }

  get averageEarlyOverheal() {
    if (this.casts.length === 0) {
      return 0;
    }
    return this.casts.reduce((sum, c) => sum + c.earlyOverhealPct, 0) / this.casts.length;
  }

  get averageHealingPerCast() {
    if (this.casts.length === 0) {
      return 0;
    }
    return this.casts.reduce((sum, c) => sum + c.healing, 0) / this.casts.length;
  }

  get fullTargetCastRate() {
    if (this.casts.length === 0) {
      return 0;
    }
    return this.casts.filter((c) => c.hits >= c.expectedTargets).length / this.casts.length;
  }

  get averageManaCost() {
    const costs = this.casts.map((c) => c.manaCost).filter((cost) => cost > 0);
    if (costs.length === 0) {
      return 0;
    }
    return costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
  }

  /** Boss kill pulls only — leftover mana converted to potential extra WG casts */
  get showManaAnalysis(): boolean {
    return Boolean(this.owner.fight.kill) && (this.owner.fight.boss ?? 0) > 0;
  }

  get extraCastsFromLeftoverMana(): number | null {
    if (!this.showManaAnalysis) {
      return null;
    }
    const avgCost = this.averageManaCost;
    if (avgCost <= 0 || this.manaValues.endingMana <= 0) {
      return null;
    }
    return Math.floor(this.manaValues.endingMana / avgCost);
  }

  get possiblePerformances(): QualitativePerformance[] {
    return [
      QualitativePerformance.Perfect,
      QualitativePerformance.Good,
      QualitativePerformance.Ok,
      QualitativePerformance.Fail,
    ];
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.WILD_GROWTH} />
          </b>{' '}
          is a high-HPS, high-cost spell. Push it when the raid is in danger. This is your primary
          mana throttle, so if you are running out of mana, cut Wild Growths from safer parts of the
          fight. Avoid casting it whenever it is available just because it is off cooldown
          {this.hasGroveGuardians ? (
            <>
              . It also summons <SpellLink spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} />
            </>
          ) : null}
          .
        </p>
        <p>
          Always aim to hit the maximum number of targets. Wild Growth only jumps to allies within
          30 yards of your primary target, so avoid casting it on players who are standing away from
          the group. A bit of overhealing is fine if it means hitting every target.
        </p>
        {(this.hasTranquility || this.hasConvoke) && (
          <p>
            Try to cast Wild Growth before <SpellLink spell={SPELLS.TRANQUILITY_CAST} /> or{' '}
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> so the HoT is already active when you
            channel them.
          </p>
        )}
        <TipBox hideIcon>
          <div>
            <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect - Full targets with
            low early overheal (&lt;{formatPercentage(PERFECT_OVERHEAL_THRESHOLD, 0)}%)
            {(this.hasTranquility || this.hasConvoke) && (
              <>
                , or full targets set up for{' '}
                {this.hasTranquility && <SpellLink spell={SPELLS.TRANQUILITY_CAST} />}
                {this.hasTranquility && this.hasConvoke && '/'}
                {this.hasConvoke && <SpellLink spell={SPELLS.CONVOKE_SPIRITS} />}
              </>
            )}
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Good} /> Good - Full targets
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Ok} /> Ok - Missed one target
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Fail} /> Bad - Missed more than one target
          </div>
        </TipBox>
      </>
    );

    const stats = [
      {
        value: `${formatPercentage(this.fullTargetCastRate, 0)}%`,
        label: 'Full Target Casts',
        tooltip: (
          <>
            Share of hardcasts that hit every available target (base {WG_BASE_TARGETS}
            {this.hasImprovedWildGrowth ? ` + ${IMPROVED_WG_EXTRA_TARGETS} Improved` : ''}
            {this.hasTreeOfLife ? ` + ${TOL_EXTRA_WG_TARGETS} during Tree of Life` : ''})
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.fullTargetCastRate,
          isGreaterThanOrEqual: { perfect: 0.9, good: 0.75, ok: 0.6 },
        }),
      },
      {
        value: `${formatPercentage(this.averageEarlyOverheal, 0)}%`,
        label: 'Avg Early Overheal',
        tooltip: (
          <>
            Average overheal across Wild Growth ticks in the first {OVERHEAL_BUFFER / 1000}s after
            each apply. High overheal alone does not fail a cast.
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.averageEarlyOverheal,
          isLessThan: {
            perfect: PERFECT_OVERHEAL_THRESHOLD,
            good: GOOD_OVERHEAL_THRESHOLD,
            ok: OK_OVERHEAL_THRESHOLD,
          },
        }),
      },
      {
        value: formatNumber(this.averageHealingPerCast),
        label: 'Avg Healing Per Cast',
        tooltip: <>Average effective healing from each hardcast Wild Growth HoT</>,
      },
    ];

    const extraCasts = this.extraCastsFromLeftoverMana;
    if (extraCasts !== null) {
      stats.push({
        value: `${extraCasts}`,
        label: 'Extra Casts Available',
        tooltip: (
          <>
            Boss kill: ending mana ({formatNumber(this.manaValues.endingMana)}) could have funded
            about this many more Wild Growths at your average cost (
            {formatNumber(this.averageManaCost)} mana)
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: extraCasts,
          isLessThanOrEqual: { perfect: 0, good: 1, ok: 3 },
        }),
      });
    }

    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview
          spell={SPELLS.WILD_GROWTH}
          title={
            <>
              <SpellLink spell={SPELLS.WILD_GROWTH} /> Overview
            </>
          }
          stats={stats}
        />
        <CastDetail
          title="Wild Growth Casts"
          casts={this.buildCastDetails()}
          possiblePerformances={this.possiblePerformances}
        />
      </GuideSection>
    );
  }

  private buildCastDetails(): PerCastData[] {
    return this.casts.map((cast) => {
      const missed = Math.max(0, cast.expectedTargets - cast.hits);
      const reasonParts: string[] = [];

      if (cast.hits >= cast.expectedTargets) {
        reasonParts.push(`Full targets (${cast.hits})`);
      } else if (missed === 1) {
        reasonParts.push(`${cast.hits}/${cast.expectedTargets} targets`);
      } else {
        reasonParts.push(`Missed ${missed} targets (${cast.hits}/${cast.expectedTargets})`);
      }

      if (cast.duringTreeOfLife) {
        reasonParts.push('Tree of Life');
      }
      if (cast.beforeCooldown && cast.cooldownSpellId !== undefined) {
        reasonParts.push(
          cast.cooldownSpellId === SPELLS.TRANQUILITY_CAST.id
            ? 'Before Tranquility'
            : 'Before Convoke',
        );
      } else if (cast.earlyOverhealPct < PERFECT_OVERHEAL_THRESHOLD) {
        reasonParts.push('Low early overheal');
      }

      const targetPerf =
        missed === 0
          ? QualitativePerformance.Perfect
          : missed === 1
            ? QualitativePerformance.Ok
            : QualitativePerformance.Fail;

      const stats: PerCastStat[] = [
        {
          value: `${cast.hits}/${cast.expectedTargets}`,
          label: 'Targets',
          performance: targetPerf,
        },
        {
          value: `${formatPercentage(cast.earlyOverhealPct, 0)}%`,
          label: 'Early Overheal',
          performance: evaluateQualitativePerformanceByThreshold({
            actual: cast.earlyOverhealPct,
            isLessThan: {
              perfect: PERFECT_OVERHEAL_THRESHOLD,
              good: GOOD_OVERHEAL_THRESHOLD,
              ok: OK_OVERHEAL_THRESHOLD,
            },
          }),
        },
        {
          value: formatNumber(cast.healing),
          label: 'Healing',
          ungraded: true,
        },
      ];

      if (this.hasTranquility || this.hasConvoke) {
        stats.push(
          cast.beforeCooldown
            ? {
                value: 'Yes',
                label: 'Pre-CD',
                performance: QualitativePerformance.Good,
              }
            : {
                value: 'No',
                label: 'Pre-CD',
                ungraded: true,
              },
        );
      }

      return {
        performance: cast.performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats,
        details: (
          <>
            {cast.performance}: {reasonParts.join(' · ')}
          </>
        ),
      };
    });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(19)}
        tooltip={
          <>
            Average allies hit per Wild Growth hardcast that did less than{' '}
            {formatPercentage(GOOD_OVERHEAL_THRESHOLD, 0)}% overhealing over the first{' '}
            {(OVERHEAL_BUFFER / 1000).toFixed(0)} seconds.
            <br />
            <br />
            Convoke-procced Wild Growths are ignored.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.WILD_GROWTH} /> Average Effective Wild Growth Hits
            </>
          }
        >
          <>{this.averageEffectiveHits.toFixed(1)}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default WildGrowth;

import SPELLS from 'common/SPELLS';
import type Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  HasTarget,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Haste from 'parser/shared/modules/Haste';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  getDirectHeal,
  isFromHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { getRemovedHot } from 'analysis/retail/druid/restoration/normalizers/SwiftmendNormalizer';
import { getSotfBuffs } from 'analysis/retail/druid/restoration/normalizers/SoulOfTheForestLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import { Fragment, type JSX, type ReactNode } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/** With Implant, only emergency (life-saving) casts off the Lifebloom target are acceptable */
const IMPLANT_TRIAGE_THRESHOLD = 0.3;
/** Without Implant, Swiftmend is a strong spot heal — triage threshold is more generous */
const CONSUME_TRIAGE_THRESHOLD = 0.5;
/** Duration threshold below which consuming a Rejuvenation or Regrowth is considered good */
const LOW_HOT_THRESHOLD_MS = 6000;
/** Swiftmend healing increased by this fraction of the consumed HoT's remaining healing */
const CONSUMED_HOT_BONUS_MULTIPLIER = 0.4;

const SWIFTMENDABLE_HOTS = [
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
];
/** Game consume order: Regrowth > Wild Growth > Rejuvenation */
const HOT_ID_CONSUME_ORDER = [
  SPELLS.REGROWTH.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
];

type SotfOutcome = 'rejuv' | 'regrowth' | 'expired' | 'overwritten' | 'unused';

interface SwiftmendCastRecord {
  timestamp: number;
  targetName: string;
  targetHealthPercent?: number;
  onLifebloomTarget: boolean;
  wasTriage: boolean;
  /** HoT removed by this cast; null when Verdant Infusion (or unknown/none) */
  consumedSpell: Spell | null;
  consumedRemainingMs?: number;
  /** Estimated remaining healing on the consumed HoT at cast time */
  consumedRemainingHealing?: number;
  /** Estimated 40% of remaining healing added to this Swiftmend (capped by effective heal) */
  consumedBonusHealing?: number;
  /** Performance from Swiftmend targeting / consume rules only */
  smPerformance: QualitativePerformance;
  /** Set when SotF is talented; resolved when the proc is spent or wasted */
  sotfOutcome: SotfOutcome | null;
}

/**
 * Tracks Swiftmend cast quality and (when talented) the linked Soul of the Forest spend.
 */
class Swiftmend extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
    haste: Haste,
    lifebloom: Lifebloom,
  };

  hotTracker!: HotTrackerRestoDruid;
  combatants!: Combatants;
  haste!: Haste;
  lifebloom!: Lifebloom;

  hardcastSwiftmendHealing = 0;
  hardcastSwiftmendOverhealing = 0;
  /** Estimated 40% of consumed HoT remaining healing added to Swiftmend */
  consumedHotBonusHealing = 0;
  /** Estimated remaining healing on HoTs at the moment they were consumed */
  consumedHotRemainingHealing = 0;
  /** Times each swiftmendable HoT was the one consumed */
  consumedHotCounts: Map<number, number> = new Map();
  /** Sum of remaining duration (ms) per consumed HoT, for average remaining */
  private consumedRemainingMsBySpell: Map<number, number> = new Map();
  consumedUnknownCount = 0;
  private lastHotTickAmount: Map<string, number> = new Map();
  /** Last known expected HoT end time, so remaining still works after HotTracker clears */
  private lastHotEnd: Map<string, number> = new Map();

  hasVi: boolean;
  hasImplant: boolean;
  hasProsperity: boolean;
  hasSotf: boolean;
  hasGroveGuardians: boolean;
  hasEverbloomR3: boolean;
  hasAbundance: boolean;
  /** Per-cast breakdown (hidden only for VI without Implant and without SotF) */
  trackCastAnalysis: boolean;

  casts: SwiftmendCastRecord[] = [];
  /** Indices of Swiftmend casts whose SotF proc is not yet resolved (oldest first) */
  private pendingSotfCastIndices: number[] = [];

  constructor(options: Options) {
    super(options);

    this.hasVi = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT);
    this.hasImplant = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPLANT_TALENT);
    this.hasProsperity = this.selectedCombatant.hasTalent(TALENTS_DRUID.PROSPERITY_TALENT);
    this.hasSotf = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT,
    );
    this.hasGroveGuardians = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasEverbloomR3 = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT,
    );
    this.hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    // VI without Implant: hide cast analysis unless SotF needs waste tracking
    this.trackCastAnalysis = this.hasImplant || !this.hasVi || this.hasSotf;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendHeal,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    if (!this.hasVi) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SWIFTMENDABLE_HOTS),
        this.onConsumableHotHeal,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SWIFTMENDABLE_HOTS),
        this.onConsumableHotBuff,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SWIFTMENDABLE_HOTS),
        this.onConsumableHotBuff,
      );
    }

    if (this.hasSotf) {
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
        this.onSotfRemove,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
        this.onSotfRefresh,
      );
    }
  }

  onConsumableHotHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    const raw = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    const key = `${event.targetID}-${event.ability.guid}`;
    this.lastHotTickAmount.set(key, raw);
    this.snapshotHotEnd(event.targetID, event.ability.guid);
  }

  onConsumableHotBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.snapshotHotEnd(event.targetID, event.ability.guid);
  }

  private snapshotHotEnd(targetId: number, spellId: number) {
    const hot = this.hotTracker.hots[targetId]?.[spellId];
    if (hot) {
      this.lastHotEnd.set(`${targetId}-${spellId}`, hot.end);
    }
  }

  onSwiftmendHeal(event: HealEvent) {
    if (isFromHardcast(event)) {
      this.hardcastSwiftmendHealing += event.amount + (event.absorbed || 0);
      this.hardcastSwiftmendOverhealing += event.overheal || 0;
    }
  }

  onSwiftmendCast(event: CastEvent) {
    const directHeal = getDirectHeal(event);
    const targetHealthPercent = directHeal
      ? calculateHealTargetHealthPercent(directHeal, true)
      : undefined;
    const target = this.combatants.getEntity(event);
    if (!target) {
      console.warn("Couldn't find target for Swiftmend cast", event);
      return;
    }

    const consume = this.hasVi ? null : this.resolveConsume(event, target.id, directHeal);

    if (!this.trackCastAnalysis) {
      return;
    }

    const triageThreshold = this.hasImplant ? IMPLANT_TRIAGE_THRESHOLD : CONSUME_TRIAGE_THRESHOLD;
    const wasTriage = targetHealthPercent !== undefined && targetHealthPercent <= triageThreshold;
    const onLifebloomTarget = target.id === this.lifebloom.activeLifebloomTarget;

    let consumedSpell: Spell | null = null;
    let consumedRemainingMs: number | undefined;
    if (consume?.spellId !== undefined) {
      consumedSpell = consume.spell;
      consumedRemainingMs = consume.remainingMs;
    }

    const smPerformance = this.hasImplant
      ? this.scoreImplantCast(onLifebloomTarget, wasTriage)
      : this.hasVi
        ? QualitativePerformance.Good
        : this.scoreConsumeCast(consume?.spellId, consumedRemainingMs, wasTriage);

    const castIndex = this.casts.length;
    this.casts.push({
      timestamp: event.timestamp,
      targetName: target.name,
      targetHealthPercent,
      onLifebloomTarget,
      wasTriage,
      consumedSpell,
      consumedRemainingMs,
      consumedRemainingHealing: consume?.remainingHealing,
      consumedBonusHealing: consume?.bonusHealing,
      smPerformance,
      sotfOutcome: null,
    });

    if (this.hasSotf) {
      // Queue this cast; overwrite resolves the oldest pending first (see onSotfRefresh)
      this.pendingSotfCastIndices.push(castIndex);
    }
  }

  private scoreImplantCast(onLifebloomTarget: boolean, wasTriage: boolean): QualitativePerformance {
    if (onLifebloomTarget || wasTriage) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Fail;
  }

  /**
   * Consume path: score by what was removed.
   * Desired priority: Wild Growth > low-duration HoT > any Regrowth > any Rejuvenation.
   * Game remove order is Regrowth > Wild Growth > Rejuvenation.
   */
  private scoreConsumeCast(
    removedSpellId: number | undefined,
    remainingMs: number | undefined,
    wasTriage: boolean,
  ): QualitativePerformance {
    if (wasTriage) {
      return QualitativePerformance.Good;
    }
    if (removedSpellId === SPELLS.WILD_GROWTH.id) {
      return QualitativePerformance.Good;
    }
    if (
      removedSpellId === SPELLS.REJUVENATION.id ||
      removedSpellId === SPELLS.REJUVENATION_GERMINATION.id ||
      removedSpellId === SPELLS.REGROWTH.id
    ) {
      const isLowDuration = (remainingMs ?? 0) < LOW_HOT_THRESHOLD_MS;
      if (isLowDuration) {
        return QualitativePerformance.Good;
      }
      if (removedSpellId === SPELLS.REGROWTH.id) {
        return QualitativePerformance.Ok;
      }
      return QualitativePerformance.Fail;
    }
    return QualitativePerformance.Ok;
  }

  private onSotfRefresh(_event: RefreshBuffEvent) {
    // A new Swiftmend overwrote an existing SotF — fail the oldest pending cast
    this.resolveOldestPendingSotf('overwritten');
  }

  private onSotfRemove(event: RemoveBuffEvent) {
    const buffed = getSotfBuffs(event);
    if (buffed.length === 0) {
      this.resolveOldestPendingSotf('expired');
      return;
    }

    const guid = buffed[0].ability.guid;
    if (guid === SPELLS.REGROWTH.id) {
      this.resolveOldestPendingSotf('regrowth');
    } else if (guid === SPELLS.REJUVENATION.id || guid === SPELLS.REJUVENATION_GERMINATION.id) {
      this.resolveOldestPendingSotf('rejuv');
    } else {
      this.resolveOldestPendingSotf('expired');
    }
  }

  private onFightEnd() {
    while (this.pendingSotfCastIndices.length > 0) {
      this.resolveOldestPendingSotf('unused');
    }
  }

  private resolveOldestPendingSotf(outcome: SotfOutcome) {
    const index = this.pendingSotfCastIndices.shift();
    if (index === undefined) {
      return;
    }
    const cast = this.casts[index];
    if (cast && cast.sotfOutcome === null) {
      cast.sotfOutcome = outcome;
    }
  }

  private finalPerformance(cast: SwiftmendCastRecord): QualitativePerformance {
    if (
      this.hasSotf &&
      (cast.sotfOutcome === 'expired' ||
        cast.sotfOutcome === 'overwritten' ||
        cast.sotfOutcome === 'unused' ||
        cast.sotfOutcome === null)
    ) {
      return QualitativePerformance.Fail;
    }
    return cast.smPerformance;
  }

  /**
   * Identify the consumed HoT, estimate remaining / bonus healing, and tally fight totals.
   * Prefers the RemoveBuff link; falls back to consume order among HoTs still expected on the target.
   */
  private resolveConsume(
    event: CastEvent,
    targetId: number,
    directHeal: HealEvent | undefined,
  ): {
    spellId: number | undefined;
    spell: Spell | null;
    remainingMs: number | undefined;
    remainingHealing: number;
    bonusHealing: number;
  } {
    const spellId = this.resolveConsumedSpellId(event, targetId);
    const remainingMs =
      spellId !== undefined
        ? this.remainingMsForHot(targetId, spellId, event.timestamp)
        : undefined;
    const remainingHealing =
      spellId !== undefined ? this.estimateRemainingHotHealing(event, targetId, spellId) : 0;
    const estimatedBonus = remainingHealing * CONSUMED_HOT_BONUS_MULTIPLIER;
    const effectiveHeal = directHeal ? directHeal.amount + (directHeal.absorbed || 0) : 0;
    const bonusHealing = Math.min(estimatedBonus, effectiveHeal);

    this.consumedHotBonusHealing += bonusHealing;
    this.consumedHotRemainingHealing += remainingHealing;
    if (spellId !== undefined) {
      this.consumedHotCounts.set(spellId, (this.consumedHotCounts.get(spellId) ?? 0) + 1);
      if (remainingMs !== undefined) {
        this.consumedRemainingMsBySpell.set(
          spellId,
          (this.consumedRemainingMsBySpell.get(spellId) ?? 0) + remainingMs,
        );
      }
    } else {
      this.consumedUnknownCount += 1;
    }

    return {
      spellId,
      spell: SWIFTMENDABLE_HOTS.find((hot) => hot.id === spellId) ?? null,
      remainingMs,
      remainingHealing,
      bonusHealing,
    };
  }

  private resolveConsumedSpellId(event: CastEvent, targetId: number): number | undefined {
    const removed = getRemovedHot(event);
    if (removed && (!HasTarget(removed) || removed.targetID === targetId)) {
      return removed.ability.guid;
    }
    return this.consumeOrderHotId(targetId, event.timestamp);
  }

  /** HoTs still expected on the target, then game consume order. */
  private consumeOrderHotId(targetId: number, timestamp: number): number | undefined {
    const present = new Set<number>();
    const hotsOn = this.hotTracker.hots[targetId];
    if (hotsOn) {
      Object.keys(hotsOn).forEach((id) => {
        const spellId = Number(id);
        if (HOT_ID_CONSUME_ORDER.includes(spellId)) {
          present.add(spellId);
        }
      });
    }
    HOT_ID_CONSUME_ORDER.forEach((spellId) => {
      const end = this.lastHotEnd.get(`${targetId}-${spellId}`);
      if (end !== undefined && end > timestamp) {
        present.add(spellId);
      }
    });
    return HOT_ID_CONSUME_ORDER.find((id) => present.has(id));
  }

  private remainingMsForHot(
    targetId: number,
    spellId: number,
    timestamp: number,
  ): number | undefined {
    const hot = this.hotTracker.hots[targetId]?.[spellId];
    if (hot) {
      return Math.max(0, hot.end - timestamp);
    }
    const snap = this.lastHotEnd.get(`${targetId}-${spellId}`);
    if (snap !== undefined) {
      return Math.max(0, snap - timestamp);
    }
    return undefined;
  }

  /**
   * Estimate remaining healing on a HoT from duration left × last observed tick size.
   * Same approach as Verdant Infusion.
   */
  private estimateRemainingHotHealing(event: CastEvent, targetId: number, spellId: number): number {
    const remainingMs = this.remainingMsForHot(targetId, spellId, event.timestamp);
    const lastTick = this.lastHotTickAmount.get(`${targetId}-${spellId}`);
    const hotInfo = this.hotTracker.hotInfo[spellId];
    if (remainingMs === undefined || !lastTick || !hotInfo) {
      return 0;
    }

    const baseTickPeriod = hotInfo.tickPeriod;
    const tickPeriod = hotInfo.noHaste ? baseTickPeriod : baseTickPeriod / (1 + this.haste.current);
    if (tickPeriod <= 0) {
      return 0;
    }

    return (remainingMs / tickPeriod) * lastTick;
  }

  private get hasConsumedHotData(): boolean {
    return this.consumedHotCounts.size > 0 || this.consumedUnknownCount > 0;
  }

  /** Fight-wide consume list for the Swiftmend statistic tooltip. */
  private renderConsumedHotBreakdown(): ReactNode {
    const items = HOT_ID_CONSUME_ORDER.filter((id) => this.consumedHotCounts.has(id)).map(
      (spellId) => {
        const count = this.consumedHotCounts.get(spellId) ?? 0;
        const remainingSum = this.consumedRemainingMsBySpell.get(spellId);
        const avgRemaining =
          remainingSum !== undefined && count > 0 ? remainingSum / count / 1000 : undefined;
        return (
          <span key={spellId}>
            <SpellLink spell={spellId} /> {count}
            {avgRemaining !== undefined ? ` (avg ${avgRemaining.toFixed(1)}s left)` : ''}
          </span>
        );
      },
    );
    if (this.consumedUnknownCount > 0) {
      items.push(<span key="unknown">unknown {this.consumedUnknownCount}</span>);
    }
    if (items.length === 0) {
      return <>none detected</>;
    }
    return items.map((item, index) => (
      <Fragment key={index}>
        {index > 0 && <>, </>}
        {item}
      </Fragment>
    ));
  }

  private spellToSequenceCast(
    spell: Spell,
    timestamp: number,
    performance: QualitativePerformance | undefined,
    tooltip: ReactNode,
  ): CastInSequence {
    return {
      timestamp,
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
      performance,
      outlineColor: performance ? qualitativePerformanceToColor(performance) : undefined,
      ghosted: performance === undefined,
      tooltip,
    };
  }

  private buildSequence(cast: SwiftmendCastRecord): CastInSequence[] {
    const overall = this.finalPerformance(cast);
    const sequence: CastInSequence[] = [
      this.spellToSequenceCast(
        SPELLS.SWIFTMEND,
        cast.timestamp,
        overall,
        <>
          <SpellLink spell={SPELLS.SWIFTMEND} /> on <strong>{cast.targetName}</strong>
          {cast.targetHealthPercent !== undefined && (
            <> ({formatPercentage(cast.targetHealthPercent, 0)}% HP)</>
          )}
        </>,
      ),
    ];

    if (!this.hasVi) {
      if (cast.consumedSpell) {
        const remainingText =
          cast.consumedRemainingMs !== undefined
            ? ` (${(cast.consumedRemainingMs / 1000).toFixed(1)}s left)`
            : '';
        sequence.push(
          this.spellToSequenceCast(
            cast.consumedSpell,
            cast.timestamp + 1,
            cast.smPerformance,
            <>
              Consumed <SpellLink spell={cast.consumedSpell} />
              {remainingText}
              {cast.consumedBonusHealing !== undefined && cast.consumedBonusHealing > 0 && (
                <> · +{formatNumber(cast.consumedBonusHealing)} bonus on Swiftmend</>
              )}
            </>,
          ),
        );
      }
    }

    if (this.hasSotf) {
      const sotfSpell = this.sotfOutcomeSpell(cast.sotfOutcome);
      const sotfPerf = this.sotfOutcomePerformance(cast.sotfOutcome);
      sequence.push(
        this.spellToSequenceCast(
          sotfSpell,
          cast.timestamp + 2,
          sotfPerf,
          this.sotfOutcomeTooltip(cast.sotfOutcome),
        ),
      );
    }

    return sequence;
  }

  private sotfOutcomeSpell(outcome: SotfOutcome | null): Spell {
    switch (outcome) {
      case 'rejuv':
        return SPELLS.REJUVENATION;
      case 'regrowth':
        return SPELLS.REGROWTH;
      case 'overwritten':
      case 'expired':
      case 'unused':
      case null:
      default:
        return SPELLS.SOUL_OF_THE_FOREST_BUFF;
    }
  }

  private sotfOutcomePerformance(outcome: SotfOutcome | null): QualitativePerformance {
    if (outcome === 'rejuv' || outcome === 'regrowth') {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Fail;
  }

  private sotfOutcomeTooltip(outcome: SotfOutcome | null): ReactNode {
    switch (outcome) {
      case 'rejuv':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> buffed{' '}
            <SpellLink spell={SPELLS.REJUVENATION} />
          </>
        );
      case 'regrowth':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> buffed{' '}
            <SpellLink spell={SPELLS.REGROWTH} />
          </>
        );
      case 'overwritten':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> overwritten
          </>
        );
      case 'expired':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> expired
          </>
        );
      case 'unused':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> unused at
            fight end
          </>
        );
      default:
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> unresolved
          </>
        );
    }
  }

  private buildCastDetails(): PerCastData[] {
    return this.casts.map((cast) => {
      const performance = this.finalPerformance(cast);
      const stats: PerCastData['stats'] = [];
      if (!this.hasVi) {
        stats.push({
          value: cast.consumedSpell ? <SpellIcon spell={cast.consumedSpell} /> : '?',
          label: 'Consumed',
          tooltip: cast.consumedSpell ? (
            <>
              Consumed <SpellLink spell={cast.consumedSpell} />
              {cast.consumedRemainingMs !== undefined && (
                <> ({(cast.consumedRemainingMs / 1000).toFixed(1)}s left)</>
              )}
            </>
          ) : (
            <>Could not detect which HoT was consumed</>
          ),
          ungraded: true,
        });
        if (cast.consumedRemainingMs !== undefined) {
          stats.push({
            value: `${(cast.consumedRemainingMs / 1000).toFixed(1)}s`,
            label: 'Left',
            tooltip: 'Estimated remaining duration on the consumed HoT',
            ungraded: true,
          });
        }
        if (cast.consumedBonusHealing !== undefined && cast.consumedBonusHealing > 0) {
          stats.push({
            value: formatNumber(cast.consumedBonusHealing),
            label: 'HoT bonus',
            tooltip: (
              <>
                Estimated {(CONSUMED_HOT_BONUS_MULTIPLIER * 100).toFixed(0)}% of remaining HoT
                healing added to this Swiftmend
                {cast.consumedRemainingHealing !== undefined && (
                  <> (remaining {formatNumber(cast.consumedRemainingHealing)})</>
                )}
              </>
            ),
            ungraded: true,
          });
        }
      }
      return {
        performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats,
        tooltip: this.castSummary(cast),
        additionalContent: {
          content: <SpellSequence casts={this.buildSequence(cast)} iconSize={34} />,
        },
        details: this.castSummary(cast),
      };
    });
  }

  private castSummary(cast: SwiftmendCastRecord): JSX.Element {
    const parts: ReactNode[] = [];

    if (this.hasImplant) {
      if (cast.onLifebloomTarget) {
        parts.push(
          <>
            on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          </>,
        );
      } else if (cast.wasTriage) {
        parts.push(<>triage cast</>);
      } else {
        parts.push(
          <>
            not on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          </>,
        );
      }
    } else if (!this.hasVi && cast.wasTriage) {
      parts.push(<>triage cast</>);
    }

    if (!this.hasVi) {
      if (cast.consumedSpell) {
        const remaining =
          cast.consumedRemainingMs !== undefined
            ? ` (${(cast.consumedRemainingMs / 1000).toFixed(1)}s)`
            : '';
        const bonus =
          cast.consumedBonusHealing !== undefined && cast.consumedBonusHealing > 0
            ? ` · +${formatNumber(cast.consumedBonusHealing)} bonus`
            : '';
        parts.push(
          <>
            consumed <SpellLink spell={cast.consumedSpell} />
            {remaining}
            {bonus}
          </>,
        );
      } else {
        parts.push(<>consumed unknown HoT</>);
      }
    }

    if (this.hasSotf) {
      parts.push(this.sotfOutcomeTooltip(cast.sotfOutcome));
    }

    return (
      <>
        {this.finalPerformance(cast)}:{' '}
        {parts.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <> · </>}
            {part}
          </Fragment>
        ))}
      </>
    );
  }

  private get cooldownReasonSpells() {
    const spells = [];
    if (this.hasSotf) {
      spells.push(TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT);
    }
    if (this.hasGroveGuardians) {
      spells.push(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    }
    if (this.hasEverbloomR3) {
      spells.push(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
    }
    return spells;
  }

  private perfBadge(perf: QualitativePerformance): JSX.Element {
    return (
      <span>
        (<span style={{ color: qualitativePerformanceToColor(perf) }}>{perf}</span>)
      </span>
    );
  }

  private get possiblePerformances(): QualitativePerformance[] {
    // Consume path can score Ok (full-duration Regrowth). Implant / VI paths cannot.
    if (!this.hasImplant && !this.hasVi) {
      return [QualitativePerformance.Good, QualitativePerformance.Ok, QualitativePerformance.Fail];
    }
    return [QualitativePerformance.Good, QualitativePerformance.Fail];
  }

  get guideSubsection(): JSX.Element {
    const explanation = this.buildExplanation();

    const showEfficiency =
      this.hasImplant ||
      this.hasVi ||
      this.hasProsperity ||
      this.hasSotf ||
      this.cooldownReasonSpells.length > 0;

    const data = (
      <RoundedPanel>
        {showEfficiency && (
          <>
            <strong>
              <SpellLink spell={SPELLS.SWIFTMEND} /> cast efficiency
            </strong>
            <CastEfficiencyBar
              spell={SPELLS.SWIFTMEND}
              gapHighlightMode={GapHighlight.FullCooldown}
              minimizeIcons
              useThresholds
            />
          </>
        )}
        {this.trackCastAnalysis && this.casts.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <CastDetail
              title="Swiftmend Casts"
              casts={this.buildCastDetails()}
              possiblePerformances={this.possiblePerformances}
            />
          </div>
        )}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  private buildExplanation(): JSX.Element {
    const cooldownSpells = this.cooldownReasonSpells;

    return (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.SWIFTMEND} />
          </b>{' '}
          is one of your highest priority spells. Cast it on yourself as close to on cooldown as
          possible
          {cooldownSpells.length > 0 ? (
            <>
              . It{' '}
              {cooldownSpells.map((spell, index) => (
                <Fragment key={spell.id}>
                  {index > 0 &&
                    (index === cooldownSpells.length - 1
                      ? cooldownSpells.length === 2
                        ? ' and '
                        : ', and '
                      : ', ')}
                  {this.cooldownSpellVerb(spell)} <SpellLink spell={spell} />
                </Fragment>
              ))}
              .
            </>
          ) : (
            <>.</>
          )}
        </p>
        {this.renderTargetingGuidance()}
        {this.renderSotfGuidance()}
      </>
    );
  }

  /** Short verb phrase for listing cooldown-tied effects in the opener */
  private cooldownSpellVerb(spell: { id: number }): string {
    if (spell.id === TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id) {
      return 'gives you';
    }
    if (spell.id === TALENTS_DRUID.GROVE_GUARDIANS_TALENT.id) {
      return 'summons';
    }
    if (spell.id === TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT.id) {
      return 'causes 3 Lifebloom blooms via';
    }
    return 'empowers';
  }

  private renderTargetingGuidance(): JSX.Element | null {
    if (this.hasImplant) {
      return (
        <p>
          If you&apos;re playing <SpellLink spell={TALENTS_DRUID.IMPLANT_TALENT} />, almost every
          Swiftmend should go onto your <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          (usually yourself). This grows a <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} />
          , which increases healing received, and therefore Everbloom's splash healing. The only
          exception is emergency triage to save a player who would die otherwise.
        </p>
      );
    }

    if (this.hasVi) {
      return (
        <p>
          With <SpellLink spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT} />, Swiftmend does not
          consume a HoT, so you do not need to worry about which HoT is on the target.
        </p>
      );
    }

    // Consume path (Prosperity / no VI)
    return (
      <>
        <p>
          Swiftmend removes a HoT on the target. The direct heal gains a portion of that HoT&apos;s
          remaining healing, but losing the HoT still costs throughput, so choose consumes
          carefully. The game removes HoTs in the order Regrowth, Wild Growth, then Rejuvenation.
          Try to consume in this priority instead:
        </p>
        <ul style={{ marginBottom: '1em' }}>
          <li>
            <SpellLink spell={SPELLS.WILD_GROWTH} /> or a low duration HoT (&lt;
            {LOW_HOT_THRESHOLD_MS / 1000}s) {this.perfBadge(QualitativePerformance.Good)}
          </li>
          <li>
            Full duration <SpellLink spell={SPELLS.REGROWTH} />{' '}
            {this.perfBadge(QualitativePerformance.Ok)}
          </li>
          <li>
            Full duration <SpellLink spell={SPELLS.REJUVENATION} />{' '}
            {this.perfBadge(QualitativePerformance.Fail)}
          </li>
        </ul>
        <p>
          Using it as a triage heal (≤{CONSUME_TRIAGE_THRESHOLD * 100}% HP) is always fine,
          regardless of what gets consumed.
        </p>
      </>
    );
  }

  private renderSotfGuidance(): JSX.Element | null {
    if (!this.hasSotf) {
      return null;
    }
    return (
      <p>
        Every Swiftmend also grants{' '}
        <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />. Make sure you
        spend the proc before your next Swiftmend. <SpellLink spell={SPELLS.REJUVENATION} /> is the
        default spender
        {this.hasAbundance ? (
          <>
            , and the cheapest way to keep <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />{' '}
            active
          </>
        ) : null}
        . <SpellLink spell={SPELLS.REGROWTH} /> is also a fine choice if the healing is needed and
        mana allows.
      </p>
    );
  }

  statistic() {
    if (this.hasVi || (!this.hasConsumedHotData && this.consumedHotBonusHealing <= 0)) {
      return null;
    }

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(15)}
        tooltip={
          <>
            Swiftmend consumes one HoT (Regrowth, then Wild Growth, then Rejuvenation) and the
            direct heal is increased by {(CONSUMED_HOT_BONUS_MULTIPLIER * 100).toFixed(0)}% of that
            HoT&apos;s remaining healing. Remaining is estimated from duration left × recent tick
            size.
            <ul>
              <li>
                HoTs consumed: <strong>{this.renderConsumedHotBreakdown()}</strong>
              </li>
              <li>
                Estimated remaining healing on consumed HoTs:{' '}
                <strong>{formatNumber(this.consumedHotRemainingHealing)}</strong>
              </li>
              <li>
                Estimated bonus added to Swiftmend:{' '}
                <strong>{formatNumber(this.consumedHotBonusHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SWIFTMEND}>
          <ItemPercentHealingDone amount={this.consumedHotBonusHealing} />
          <br />
          <small>from consumed HoT bonus</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Swiftmend;

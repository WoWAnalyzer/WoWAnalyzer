import type { JSX } from 'react';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FightEndEvent,
  FreeCastEvent,
  GetRelatedEvents,
  GetRelatedEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Abilities from '../Abilities';
import Haste from 'parser/shared/modules/Haste';
import { formatPercentage } from 'common/format';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { EnhancementEventLinks, GCD_TOLERANCE } from '../../constants';
import { addEnhancedCastReason, addInefficientCastReason } from 'parser/core/EventMetaLib';
import { getApplicableRules, HighPriorityAbilities } from '../../common';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';

type WindowSource = 'cast' | 'proc';

interface RecentWindowTrigger {
  spellId: number;
  timestamp: number;
}

interface WindowContext {
  source: WindowSource;
  primarySpellId: number;
}

interface ThorimsTriggerStats {
  attempts: number;
  total: number;
  windstrike: number;
  stormstrike: number;
  crashLightning: number;
}

interface DoomWindsWindowCastCounts {
  primaryCasts: number;
  crashLightningCasts: number;
  hotHandLavaLashCasts: number;
}

interface ThorimsTriggerOpportunityBreakdown {
  primaryCasts: number;
  missedPrimaryCasts: number;
  maximumPrimaryCasts: number;
  unreducedMaximumPrimaryCasts: number;
  crashLightningCasts: number;
  missedCrashLightningCasts: number;
  maximumCrashLightningCasts: number;
  hotHandLavaLashCasts: number;
  estimatedMaximumTriggers: number;
}

interface DoomWindsWindowBreakdown {
  triggerStats: ThorimsTriggerStats;
  triggerOpportunities: ThorimsTriggerOpportunityBreakdown;
  unusedGlobalCooldowns: number;
  gcdPerformance: QualitativePerformance;
  triggerPerformance: QualitativePerformance;
  performance: QualitativePerformance;
  sequence: CastInSequence[];
}

interface DoomWindsWindow {
  event: ApplyBuffEvent | RefreshBuffEvent;
  hasteAdjustedWastedPrimaryCooldown: number;
  hasteAdjustedWastedCrashLightningCooldown: number;
  castEvents: CastEvent[];
  unusedGcdTime: number;
  globalCooldowns: number[];
  windowSource: WindowSource;
  primarySpellId: number;
  hotHandActiveRanges: { start: number; end: number }[];
  start: number;
  end?: number | null;
}

class DoomWinds extends Analyzer.withDependencies({
  haste: Haste,
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  private static readonly WINDOW_TRIGGER_BUFFER_MS = 150;
  private static readonly STORMSTRIKE_BASE_COOLDOWN_MS = 7500;
  private static readonly WINDSTRIKE_BASE_COOLDOWN_MS = 3000;

  private readonly hasAscendance: boolean = false;
  private readonly hasDRE: boolean = false;
  private readonly isTotemic: boolean = false;
  private readonly hasElementalTempo: boolean = false;
  private readonly hasHotHand: boolean = false;
  private readonly hasVoltaicBlaze: boolean = false;
  private readonly crashLightningCD: number;
  private readonly ascendanceCastRules: HighPriorityAbilities = [];

  private readonly windows: DoomWindsWindow[] = [];

  private activeWindow: DoomWindsWindow | null = null;
  private windstrikeOnCooldown = true;
  private lastCooldownWasteCheck = 0;
  private globalCooldownEnds = 0;
  private recentWindowTrigger: RecentWindowTrigger | null = null;
  private hotHandBuffActive = false;
  private hotHandActiveStart: number | null = null;

  constructor(options: Options) {
    super(options);

    const abilities = this.deps.abilities;

    this.hasAscendance = this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT);
    this.hasDRE = this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
    this.isTotemic = this.selectedCombatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);
    this.hasElementalTempo = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_TEMPO_TALENT);
    this.hasHotHand = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    this.hasVoltaicBlaze = this.selectedCombatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT);
    this.crashLightningCD =
      abilities.getAbility(TALENTS.CRASH_LIGHTNING_TALENT.id)!.cooldown * 1000;

    this.active = this.selectedCombatant.hasTalent(TALENTS.DOOM_WINDS_TALENT);
    if (!this.active) {
      return;
    }
    abilities.add({
      spell: SPELLS.WINDSTRIKE_CAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 3 / (1 + haste),
      charges: 1 + (this.selectedCombatant.hasTalent(TALENTS.STORMBLAST_TALENT) ? 1 : 0),
      gcd: {
        base: 1500,
      },
      enabled: this.hasAscendance || this.hasDRE,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
        maxCasts: () => this.maxCasts,
      },
    });

    this.ascendanceCastRules.push({
      spellId: [
        SPELLS.LIGHTNING_BOLT.id,
        TALENTS.CHAIN_LIGHTNING_TALENT.id,
        SPELLS.TEMPEST_CAST.id,
        SPELLS.PRIMORDIAL_STORM_CAST.id,
      ],
      condition: (event) => this.isMaelstromSpenderAtOrAboveStacks(event, 10),
      enhancedCastReason: () => (
        <>
          Spending <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> at 10 stacks takes priority to
          avoid overcapping during this window.
        </>
      ),
    });

    if (this.isTotemic && this.hasHotHand) {
      this.ascendanceCastRules.push({
        spellId: TALENTS.LAVA_LASH_TALENT.id,
        condition: (event) =>
          this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id, event.timestamp),
        enhancedCastReason: () => (
          <>
            <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> takes priority during{' '}
            <SpellLink spell={TALENTS.HOT_HAND_TALENT} />.
          </>
        ),
      });
    }

    if (this.isTotemic && this.hasElementalTempo) {
      this.ascendanceCastRules.push({
        spellId: [
          SPELLS.LIGHTNING_BOLT.id,
          TALENTS.CHAIN_LIGHTNING_TALENT.id,
          SPELLS.TEMPEST_CAST.id,
          SPELLS.PRIMORDIAL_STORM_CAST.id,
        ],
        condition: (event) => this.isMaelstromSpenderAtOrAboveStacks(event, 5),
        enhancedCastReason: () => (
          <>
            Totemic <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} /> builds can spend{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> at 5+ stacks during this window.
          </>
        ),
      });
    }

    if (!this.isTotemic && this.hasVoltaicBlaze) {
      this.ascendanceCastRules.push({
        spellId: SPELLS.VOLTAIC_BLAZE_CAST.id,
        condition: () => true,
        enhancedCastReason: () => (
          <>
            <SpellLink spell={SPELLS.VOLTAIC_BLAZE_CAST} /> is a valid Stormbringer priority cast
            during this window.
          </>
        ),
      });
    }

    // Tracking start end end of cooldown windows
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_WINDS_BUFF),
      this.onCooldownStart,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_WINDS_BUFF),
      this.onCooldownStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DOOM_WINDS_BUFF),
      this.onCooldownEnd,
    );
    this.addEventListener(Events.fightend, this.onCooldownEnd);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.DOOM_WINDS_TALENT, TALENTS.ASCENDANCE_ENHANCEMENT_TALENT]),
      this.onDirectWindowTrigger,
    );

    // Usage within the cooldown window
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.onWindstrikeUsableUpdate,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);

    if (this.hasHotHand) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
        this.onHotHandApply,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
        this.onHotHandRemove,
      );
    }
  }

  private onHotHandApply(event: ApplyBuffEvent) {
    this.hotHandBuffActive = true;
    if (this.activeWindow) {
      this.hotHandActiveStart = event.timestamp;
    }
  }

  private onHotHandRemove(event: RemoveBuffEvent) {
    this.hotHandBuffActive = false;
    if (this.activeWindow && this.hotHandActiveStart !== null) {
      this.activeWindow.hotHandActiveRanges.push({
        start: this.hotHandActiveStart,
        end: event.timestamp,
      });
      this.hotHandActiveStart = null;
    }
  }

  private onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;
    if (this.activeWindow) {
      this.activeWindow.globalCooldowns.push(event.duration);
    }
  }

  private onWindstrikeUsableUpdate(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      this.windstrikeOnCooldown = true;
    }
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.windstrikeOnCooldown = false;
      this.lastCooldownWasteCheck = event.timestamp;
    }
  }

  private onDirectWindowTrigger(event: CastEvent) {
    this.recentWindowTrigger = {
      spellId: event.ability.guid,
      timestamp: event.timestamp,
    };
  }

  /**
   * Records a cooldown usage window for Doom Winds / Ascendance.
   * @remarks
   * Deeply Rooted Elements appears as a fabricated cast (via apply/refresh buff).
   */
  private onCooldownStart(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.activeWindow) {
      this.activeWindow = this.createWindow(event);

      if (this.hotHandBuffActive) {
        this.hotHandActiveStart = event.timestamp;
      }
    }
    this.lastCooldownWasteCheck = event.timestamp;
  }

  private onCast(event: CastEvent) {
    if (
      !this.activeWindow ||
      [
        TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
        TALENTS.DOOM_WINDS_TALENT.id,
        SPELLS.MELEE.id,
      ].includes(event.ability.guid) ||
      !event.globalCooldown
    ) {
      return;
    }

    this.activeWindow.unusedGcdTime += Math.max(event.timestamp - this.globalCooldownEnds, 0);

    const primarySpellId = this.activeWindow.primarySpellId;
    const isPriorityCast =
      event.ability.guid === primarySpellId ||
      event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id;

    if (!isPriorityCast && !this.isAllowedCastDuringWindow(event)) {
      this.recordWastedTriggerOpportunity(event.timestamp);
    }

    this.lastCooldownWasteCheck = event.timestamp;
    this.activeWindow.castEvents.push(event);
  }

  private onCooldownEnd(event: RemoveBuffEvent | FightEndEvent) {
    if (this.activeWindow) {
      this.activeWindow.end = event.timestamp;
      this.recordWastedTriggerOpportunity(
        Math.max(event.timestamp - 1, this.lastCooldownWasteCheck),
      );

      this.closeActiveHotHandRange(this.activeWindow, event.timestamp);

      this.windows.push(this.activeWindow);
      this.activeWindow = null;
    }
  }

  private createWindow(event: ApplyBuffEvent | RefreshBuffEvent): DoomWindsWindow {
    const { source, primarySpellId } = this.getWindowContext(event.timestamp);

    return {
      event,
      windowSource: source,
      primarySpellId,
      start: Math.max(event.timestamp, this.globalCooldownEnds),
      castEvents: [],
      hasteAdjustedWastedPrimaryCooldown: 0,
      hasteAdjustedWastedCrashLightningCooldown: 0,
      globalCooldowns: [],
      unusedGcdTime: 0,
      hotHandActiveRanges: [],
    };
  }

  private closeActiveHotHandRange(window: DoomWindsWindow, endTimestamp: number) {
    if (this.hotHandActiveStart !== null) {
      window.hotHandActiveRanges.push({
        start: this.hotHandActiveStart,
        end: endTimestamp,
      });
      this.hotHandActiveStart = null;
    }
  }

  private getWindowContext(timestamp: number): WindowContext {
    if (
      this.recentWindowTrigger &&
      timestamp - this.recentWindowTrigger.timestamp <= DoomWinds.WINDOW_TRIGGER_BUFFER_MS
    ) {
      if (this.recentWindowTrigger.spellId === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) {
        return {
          source: 'cast',
          primarySpellId: SPELLS.WINDSTRIKE_CAST.id,
        };
      }
      if (this.recentWindowTrigger.spellId === TALENTS.DOOM_WINDS_TALENT.id) {
        return {
          source: 'cast',
          primarySpellId: SPELLS.STORMSTRIKE.id,
        };
      }
    }

    if (this.hasDRE) {
      return {
        source: 'proc',
        primarySpellId: SPELLS.WINDSTRIKE_CAST.id,
      };
    }

    if (this.hasAscendance) {
      return {
        source: 'proc',
        primarySpellId: SPELLS.STORMSTRIKE.id,
      };
    }

    return {
      source: 'cast',
      primarySpellId: SPELLS.STORMSTRIKE.id,
    };
  }

  private isMaelstromSpenderAtOrAboveStacks(
    event: CastEvent | FreeCastEvent,
    minimumStacks: number,
  ): boolean {
    const stacksSpent = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    return (stacksSpent ?? 0) >= minimumStacks;
  }

  private isAllowedCastDuringWindow(event: CastEvent): boolean {
    const firstApplicableRule = getApplicableRules(event, this.ascendanceCastRules)?.at(0);
    if (!firstApplicableRule) {
      return false;
    }

    if (typeof firstApplicableRule === 'object') {
      if (firstApplicableRule.enhancedCastReason) {
        const reason = firstApplicableRule.enhancedCastReason(true);
        if (reason) {
          addEnhancedCastReason(event, reason);
        }
      }
      return true;
    }

    return firstApplicableRule === event.ability.guid;
  }

  private isCrashLightningAvailable(timestamp: number): boolean {
    return (
      this.deps.spellUsable.isAvailable(TALENTS.CRASH_LIGHTNING_TALENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.STORM_UNLEASHED_BUFF.id, timestamp)
    );
  }

  private recordWastedTriggerOpportunity(timestamp: number) {
    if (!this.activeWindow || timestamp <= this.lastCooldownWasteCheck) {
      return;
    }

    const wastedTime = this.getHasteAdjustedCooldownWasteSinceLastWasteCheck(timestamp);
    if (this.deps.spellUsable.isAvailable(this.activeWindow.primarySpellId)) {
      this.activeWindow.hasteAdjustedWastedPrimaryCooldown += wastedTime;
      return;
    }

    if (this.isCrashLightningAvailable(timestamp)) {
      this.activeWindow.hasteAdjustedWastedCrashLightningCooldown += wastedTime;
    }
  }

  private getHasteAdjustedCooldownWasteSinceLastWasteCheck(timestamp: number): number {
    return (timestamp - this.lastCooldownWasteCheck) * (1 + this.deps.haste.current);
  }

  private get guideSpell() {
    return this.hasAscendance
      ? TALENTS.ASCENDANCE_ENHANCEMENT_TALENT
      : this.hasDRE
        ? TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT
        : TALENTS.DOOM_WINDS_TALENT;
  }

  get maxCasts() {
    return this.windows.reduce((total, cast) => {
      if (cast.primarySpellId !== SPELLS.WINDSTRIKE_CAST.id) {
        return total;
      }

      const counts = this.collectWindowCastCounts(cast);
      return total + counts.primaryCasts + this.getMissedPrimaryCasts(cast, counts);
    }, 0);
  }

  private getWindowSourceLabel(source: WindowSource): string {
    switch (source) {
      case 'cast':
        return 'Cast';
      case 'proc':
        return 'Proc';
    }
  }

  private collectWindowCastCounts(cast: DoomWindsWindow): DoomWindsWindowCastCounts {
    const counts: DoomWindsWindowCastCounts = {
      primaryCasts: 0,
      crashLightningCasts: 0,
      hotHandLavaLashCasts: 0,
    };

    for (const event of cast.castEvents) {
      if (event.ability.guid === cast.primarySpellId) {
        counts.primaryCasts += 1;
      }
      if (event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id) {
        counts.crashLightningCasts += 1;
      }
      if (
        this.hasHotHand &&
        event.ability.guid === TALENTS.LAVA_LASH_TALENT.id &&
        this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id, event.timestamp)
      ) {
        counts.hotHandLavaLashCasts += 1;
      }
    }

    return counts;
  }

  private getUnusedGlobalCooldowns(cast: DoomWindsWindow) {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    return Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
  }

  private getMissedCrashLightningCasts(cast: DoomWindsWindow): number {
    return Math.floor(cast.hasteAdjustedWastedCrashLightningCooldown / this.crashLightningCD);
  }

  private getPrimaryBaseCooldown(cast: DoomWindsWindow): number {
    return cast.primarySpellId === SPELLS.STORMSTRIKE.id
      ? DoomWinds.STORMSTRIKE_BASE_COOLDOWN_MS
      : DoomWinds.WINDSTRIKE_BASE_COOLDOWN_MS;
  }

  private getMinimumPrimaryCastOpportunities(cast: DoomWindsWindow): number {
    if (cast.primarySpellId !== SPELLS.STORMSTRIKE.id || cast.end == null) {
      return 0;
    }

    const windowDuration = Math.max(cast.end - cast.start, 0);
    return 1 + Math.floor(windowDuration / this.getPrimaryBaseCooldown(cast));
  }

  private getMissedPrimaryCasts(
    cast: DoomWindsWindow,
    counts: DoomWindsWindowCastCounts = this.collectWindowCastCounts(cast),
  ): number {
    const wasteBasedMissedCasts = Math.floor(
      cast.hasteAdjustedWastedPrimaryCooldown / this.getPrimaryBaseCooldown(cast),
    );
    const minimumGuaranteedOpportunities = Math.max(
      this.getMinimumPrimaryCastOpportunities(cast) -
        counts.primaryCasts -
        counts.hotHandLavaLashCasts,
      0,
    );

    return Math.max(wasteBasedMissedCasts, minimumGuaranteedOpportunities);
  }

  private getHotHandOverlapRatio(cast: DoomWindsWindow): number {
    const hotHandActiveDuration = cast.hotHandActiveRanges.reduce(
      (total, range) => total + (range.end - range.start),
      0,
    );
    const windowDuration = (cast.end ?? cast.event.timestamp) - cast.start;
    return windowDuration > 0 ? hotHandActiveDuration / windowDuration : 0;
  }

  private getThorimsTriggerOpportunityBreakdown(
    cast: DoomWindsWindow,
    counts: DoomWindsWindowCastCounts,
  ): ThorimsTriggerOpportunityBreakdown {
    const missedPrimaryCasts = this.getMissedPrimaryCasts(cast, counts);
    const missedCrashLightningCasts = this.getMissedCrashLightningCasts(cast);

    // Unreduced maximum: what the primary max would be without HH adjustment
    const wasteBasedMissedCasts = Math.floor(
      cast.hasteAdjustedWastedPrimaryCooldown / this.getPrimaryBaseCooldown(cast),
    );
    const unreducedMinGuaranteed = Math.max(
      this.getMinimumPrimaryCastOpportunities(cast) - counts.primaryCasts,
      0,
    );
    const unreducedMissedPrimaryCasts = Math.max(wasteBasedMissedCasts, unreducedMinGuaranteed);
    const unreducedMaximumPrimaryCasts = counts.primaryCasts + unreducedMissedPrimaryCasts;

    const rawMaximumTriggers =
      counts.primaryCasts +
      missedPrimaryCasts +
      counts.crashLightningCasts +
      missedCrashLightningCasts;
    const estimatedMaximumTriggers = Math.max(
      rawMaximumTriggers - counts.hotHandLavaLashCasts,
      counts.primaryCasts + counts.crashLightningCasts,
    );

    return {
      primaryCasts: counts.primaryCasts,
      missedPrimaryCasts,
      maximumPrimaryCasts: counts.primaryCasts + missedPrimaryCasts,
      unreducedMaximumPrimaryCasts,
      crashLightningCasts: counts.crashLightningCasts,
      missedCrashLightningCasts,
      maximumCrashLightningCasts: counts.crashLightningCasts + missedCrashLightningCasts,
      hotHandLavaLashCasts: counts.hotHandLavaLashCasts,
      estimatedMaximumTriggers,
    };
  }

  private getPrimaryStrikeSpell(cast: DoomWindsWindow) {
    return cast.primarySpellId === SPELLS.STORMSTRIKE.id
      ? SPELLS.STORMSTRIKE
      : SPELLS.WINDSTRIKE_CAST;
  }

  private getThorimsTriggerStats(cast: DoomWindsWindow): ThorimsTriggerStats {
    const stats: ThorimsTriggerStats = {
      attempts: 0,
      total: 0,
      windstrike: 0,
      stormstrike: 0,
      crashLightning: 0,
    };

    for (const event of cast.castEvents) {
      if (
        event.ability.guid !== cast.primarySpellId &&
        event.ability.guid !== TALENTS.CRASH_LIGHTNING_TALENT.id
      ) {
        continue;
      }

      stats.attempts += 1;

      const freeCast = GetRelatedEvent<FreeCastEvent>(
        event,
        EnhancementEventLinks.THORIMS_INVOCATION_LINK,
        (relatedEvent) => relatedEvent.type === EventType.FreeCast,
      );
      if (!freeCast) {
        continue;
      }

      if (freeCast.ability.guid === TALENTS.CHAIN_LIGHTNING_TALENT.id) {
        const damageEvents = GetRelatedEvents<DamageEvent>(
          freeCast,
          EnhancementEventLinks.THORIMS_INVOCATION_DAMAGE_LINK,
          (relatedEvent) => relatedEvent.type === EventType.Damage,
        );
        if (damageEvents.length < 2) {
          addInefficientCastReason(
            event,
            <>
              <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> cast{' '}
              <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> when it should have been primed
              to cast <SpellLink spell={SPELLS.LIGHTNING_BOLT} />.
            </>,
          );
        }
      }

      stats.total += 1;

      switch (freeCast.ability.guid) {
        case SPELLS.WINDSTRIKE_CAST.id:
          stats.windstrike += 1;
          break;
        case SPELLS.STORMSTRIKE.id:
          stats.stormstrike += 1;
          break;
        case TALENTS.CRASH_LIGHTNING_TALENT.id:
          stats.crashLightning += 1;
          break;
      }
    }

    return stats;
  }

  private getTriggerPerformance(
    cast: DoomWindsWindow,
    triggerStats: ThorimsTriggerStats,
    triggerOpportunities: ThorimsTriggerOpportunityBreakdown,
  ): QualitativePerformance {
    const triggerRate =
      triggerOpportunities.estimatedMaximumTriggers === 0
        ? 1
        : triggerStats.total / triggerOpportunities.estimatedMaximumTriggers;
    const hotHandOverlapRatio = this.getHotHandOverlapRatio(cast);

    let performance = evaluateQualitativePerformanceByThreshold({
      actual: triggerRate,
      isGreaterThanOrEqual: {
        perfect: 1,
        good: 0.8,
        ok: 0.6,
      },
    });

    if (
      this.hasHotHand &&
      hotHandOverlapRatio > 0.5 &&
      performance === QualitativePerformance.Fail
    ) {
      performance = QualitativePerformance.Ok;
    }

    return performance;
  }

  private getAverageGcdOfWindow(cast: DoomWindsWindow) {
    if (cast.globalCooldowns.length === 0) {
      return 1500 + GCD_TOLERANCE;
    }

    return (
      cast.globalCooldowns.reduce((total, gcdDuration) => total + gcdDuration + GCD_TOLERANCE, 0) /
      cast.globalCooldowns.length
    );
  }

  private getGcdPerformance(cast: DoomWindsWindow): QualitativePerformance {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    const unusedGlobalCooldowns = Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
    const estimatedPotentialCasts = ((cast.end ?? cast.event.timestamp) - cast.start) / avgGcd;
    if (estimatedPotentialCasts <= 0) {
      return QualitativePerformance.Perfect;
    }

    const gcdPerfCalc = (unusedGlobalCooldowns / estimatedPotentialCasts) * 100;

    return evaluateQualitativePerformanceByThreshold({
      actual: gcdPerfCalc,
      isLessThanOrEqual: {
        perfect: 7.5,
        good: 15,
        ok: 25,
      },
    });
  }

  private buildSpellSequence(cast: DoomWindsWindow): CastInSequence[] {
    return cast.castEvents.map((event) => ({
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon: event.ability.abilityIcon.replace('.jpg', ''),
      tooltip: (
        <>
          <SpellLink spell={event.ability.guid} />
          <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
        </>
      ),
    }));
  }

  private buildWindowBreakdown(cast: DoomWindsWindow): DoomWindsWindowBreakdown {
    const counts = this.collectWindowCastCounts(cast);
    const triggerStats = this.getThorimsTriggerStats(cast);
    const triggerOpportunities = this.getThorimsTriggerOpportunityBreakdown(cast, counts);
    const unusedGlobalCooldowns = this.getUnusedGlobalCooldowns(cast);
    const gcdPerformance = this.getGcdPerformance(cast);
    const triggerPerformance = this.getTriggerPerformance(cast, triggerStats, triggerOpportunities);

    return {
      triggerStats,
      triggerOpportunities,
      unusedGlobalCooldowns,
      gcdPerformance,
      triggerPerformance,
      performance: getLowestPerf([gcdPerformance, triggerPerformance]),
      sequence: this.buildSpellSequence(cast),
    };
  }

  private buildPerCastData(): PerCastData[] {
    return this.windows.map((cast) => {
      const breakdown = this.buildWindowBreakdown(cast);

      return {
        performance: breakdown.performance,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        stats: [
          {
            value: this.getWindowSourceLabel(cast.windowSource),
            label: 'Source',
            performance: QualitativePerformance.Perfect,
          },
          {
            value: `${breakdown.triggerStats.total}/${breakdown.triggerOpportunities.estimatedMaximumTriggers}`,
            label: 'Thorim Triggers',
            tooltip: (
              <>
                Estimated maximum <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> triggers.
              </>
            ),
            performance: breakdown.triggerPerformance,
          },
          {
            value: `${breakdown.unusedGlobalCooldowns}`,
            label: 'Unused GCDs',
            tooltip: <>Estimated unused global cooldowns during this window.</>,
            performance: breakdown.gcdPerformance,
          },
        ],
        details: (
          <>
            <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> may have been able to trigger
            from the following sources:
            <ul>
              <li>
                <SpellLink spell={this.getPrimaryStrikeSpell(cast)} />:{' '}
                {breakdown.triggerOpportunities.primaryCasts}/
                {breakdown.triggerOpportunities.unreducedMaximumPrimaryCasts}
                {breakdown.triggerOpportunities.hotHandLavaLashCasts > 0 &&
                  breakdown.triggerOpportunities.maximumPrimaryCasts <
                    breakdown.triggerOpportunities.unreducedMaximumPrimaryCasts && (
                    <ul>
                      <li>
                        <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> has higher priority during{' '}
                        <SpellLink spell={TALENTS.HOT_HAND_TALENT} />, reducing expected triggers
                        from <SpellLink spell={this.getPrimaryStrikeSpell(cast)} /> to{' '}
                        {breakdown.triggerOpportunities.maximumPrimaryCasts}.
                      </li>
                    </ul>
                  )}
              </li>
              {breakdown.triggerOpportunities.maximumCrashLightningCasts > 0 && (
                <li>
                  <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} />:{' '}
                  {breakdown.triggerOpportunities.crashLightningCasts}/
                  {breakdown.triggerOpportunities.maximumCrashLightningCasts}
                </li>
              )}
            </ul>
          </>
        ),
        additionalContent:
          breakdown.sequence.length > 0
            ? {
                title: 'Cast Sequence',
                content: <SpellSequence casts={breakdown.sequence} iconSize={40} />,
              }
            : undefined,
      };
    });
  }

  private description(): JSX.Element {
    if (!this.hasAscendance && !this.hasDRE) {
      return (
        <>
          <p>
            Use{' '}
            <strong>
              <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />
            </strong>{' '}
            on cooldown unless you're holding it for a specific damage check.
          </p>
        </>
      );
    }

    return (
      <>
        <p>
          <SpellLink spell={SPELLS.DOOM_WINDS_BUFF} /> windows can come from{' '}
          <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />,
          {this.hasAscendance ? (
            <>
              {' '}
              direct <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> casts,
            </>
          ) : null}
          {this.hasDRE ? (
            <>
              {' '}
              random <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> procs that activate{' '}
              <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />,
            </>
          ) : null}{' '}
          {this.hasAscendance ? (
            <>and Ascendance's random Doom Winds procs while Ascendance is inactive,</>
          ) : null}{' '}
          depending on your talents.
        </p>
        <p>
          During windows without <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
          effects, prioritize <SpellLink spell={SPELLS.STORMSTRIKE} /> and{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> to generate{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> procs while spending{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />.
        </p>
        {(this.hasAscendance || this.hasDRE) && (
          <p>
            During windows with <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
            effects, <SpellLink spell={SPELLS.STORMSTRIKE} /> is replaced by{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />. When combined with{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />, each{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> cast will almost always reset its own
            cooldown.
          </p>
        )}
      </>
    );
  }

  statistic() {
    return null;
  }

  get guideSubsection() {
    if (!this.active) {
      return null;
    }

    return (
      <GuideSection spell={this.guideSpell} explanation={this.description()}>
        <CastDetail title="Doom Winds Windows" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }
}

export default DoomWinds;

import type { JSX } from 'react';
import Events, {
  AnyEvent,
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
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Abilities from '../Abilities';
import Haste from 'parser/shared/modules/Haste';
import { formatNumber } from 'common/format';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import {
  EmbeddedTimelineContainer,
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { MaelstromWeaponTracker } from 'analysis/retail/shaman/enhancement/modules/resourcetracker';
import { EnhancementEventLinks, GCD_TOLERANCE } from '../../constants';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import { getApplicableRules, HighPriorityAbilities } from '../../common';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';

type WindowSource = 'doom-winds' | 'ascendance' | 'deeply-rooted-elements';

interface RecentWindowTrigger {
  spellId: number;
  timestamp: number;
}

interface ThorimsTriggerStats {
  attempts: number;
  total: number;
  windstrike: number;
  stormstrike: number;
  crashLightning: number;
}

interface DoomWindsTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface DoomWindsCooldownCast extends CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent> {
  extraDamage: number;
  hasteAdjustedWastedCooldown: number;
  hasteAdjustedWastedCrashLightningCooldown: number;
  timeline: DoomWindsTimeline;
  unusedGcdTime: number;
  globalCooldowns: number[];
  windowSource: WindowSource;
  primarySpellId: number;
}

class DoomWinds extends MajorCooldown<DoomWindsCooldownCast> {
  private static readonly WINDOW_TRIGGER_BUFFER_MS = 150;

  static dependencies = {
    ...MajorCooldown.dependencies,
    haste: Haste,
    spellUsable: SpellUsable,
    abilities: Abilities,
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  private readonly hasAscendance: boolean = false;
  private readonly hasDRE: boolean = false;
  private readonly crashLightningCD: number;

  // dependency properties
  protected haste!: Haste;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected maelstromWeaponTracker!: MaelstromWeaponTracker;

  protected activeWindow: DoomWindsCooldownCast | null = null;
  protected windstrikeOnCooldown = true;
  protected lastCooldownWasteCheck = 0;

  protected globalCooldownEnds = 0;
  protected recentWindowTrigger: RecentWindowTrigger | null = null;

  // building these in constructor as rules need to reference msw tracker
  readonly ascendanceCastRules: HighPriorityAbilities = [];

  constructor(options: Options) {
    super({ spell: TALENTS.DOOM_WINDS_TALENT }, options);

    const abilities = options.abilities as Abilities;

    this.hasAscendance = this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT);
    this.hasDRE = this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
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
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.detectWindstrikeCasts,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;
    if (this.activeWindow) {
      this.activeWindow.timeline.events?.push(event);
      this.activeWindow.globalCooldowns.push(event.duration);
    }
  }

  detectWindstrikeCasts(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      this.windstrikeOnCooldown = true;
    }
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.windstrikeOnCooldown = false;
      this.lastCooldownWasteCheck = event.timestamp;
    }
  }

  onDirectWindowTrigger(event: CastEvent) {
    this.recentWindowTrigger = {
      spellId: event.ability.guid,
      timestamp: event.timestamp,
    };
  }

  get maxCasts() {
    return this.casts.reduce((total: number, cast: DoomWindsCooldownCast) => {
      return (
        total +
        cast.timeline.events.filter(
          (c) => c.type === EventType.Cast && c.ability.guid === SPELLS.WINDSTRIKE_CAST.id,
        ).length +
        this.getMissedWindstrikes(cast)
      );
    }, 0);
  }

  /**
   * Records a cooldown usage window for Doom Winds / Ascendance.
   * @remarks
   * Deeply Rooted Elements appears as a fabricated cast (via apply/refresh buff).
   */
  onCooldownStart(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.activeWindow) {
      const windowSource = this.getWindowSource(event.timestamp);
      const primarySpellId =
        windowSource === 'doom-winds' ? SPELLS.STORMSTRIKE.id : SPELLS.WINDSTRIKE_CAST.id;
      this.activeWindow ??= {
        event: event,
        windowSource: windowSource,
        primarySpellId,
        timeline: {
          start: Math.max(event.timestamp, this.globalCooldownEnds),
          events: [],
        },
        extraDamage: 0,
        hasteAdjustedWastedCooldown: 0,
        hasteAdjustedWastedCrashLightningCooldown: 0,
        globalCooldowns: [],
        unusedGcdTime: 0,
      };
    }
    this.lastCooldownWasteCheck = event.timestamp;
  }

  private getWindowSource(timestamp: number): WindowSource {
    if (
      this.recentWindowTrigger &&
      timestamp - this.recentWindowTrigger.timestamp <= DoomWinds.WINDOW_TRIGGER_BUFFER_MS
    ) {
      if (this.recentWindowTrigger.spellId === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) {
        return 'ascendance';
      }
      if (this.recentWindowTrigger.spellId === TALENTS.DOOM_WINDS_TALENT.id) {
        return 'doom-winds';
      }
    }

    if (this.hasDRE) {
      return 'deeply-rooted-elements';
    }

    return this.hasAscendance ? 'ascendance' : 'doom-winds';
  }

  private explainSource(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const sourceValue = cast.windowSource === 'deeply-rooted-elements' ? 'Proc' : 'Cast';
    const sourceDetails =
      cast.windowSource === 'deeply-rooted-elements'
        ? 'This window came from a Deeply Rooted Elements proc.'
        : 'This window came from a direct cooldown cast.';

    return {
      check: 'source',
      timestamp: cast.event.timestamp,
      performance: QualitativePerformance.Perfect,
      summary: <>{sourceValue}</>,
      details: <div>{sourceDetails}</div>,
    };
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
      this.spellUsable.isAvailable(TALENTS.CRASH_LIGHTNING_TALENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.STORM_UNLEASHED_BUFF.id, timestamp)
    );
  }

  private recordWastedTriggerOpportunity(timestamp: number) {
    if (!this.activeWindow || timestamp <= this.lastCooldownWasteCheck) {
      return;
    }

    const wastedTime = this.hasteAdjustedCooldownWasteSinceLastWasteCheck(timestamp);

    if (this.spellUsable.isAvailable(this.activeWindow.primarySpellId)) {
      this.activeWindow.hasteAdjustedWastedCooldown += wastedTime;
      return;
    }

    if (this.isCrashLightningAvailable(timestamp)) {
      this.activeWindow.hasteAdjustedWastedCrashLightningCooldown += wastedTime;
    }
  }

  onCast(event: CastEvent) {
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
    this.activeWindow.timeline.events.push(event);
  }

  onDamage(event: DamageEvent) {
    if (this.activeWindow) {
      this.activeWindow.extraDamage += event.amount;
    }
  }

  onCooldownEnd(event: RemoveBuffEvent | FightEndEvent) {
    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
      this.recordWastedTriggerOpportunity(
        Math.max(event.timestamp - 1, this.lastCooldownWasteCheck),
      );
      this.recordCooldown(this.activeWindow);
      this.activeWindow = null;
    }
  }

  hasteAdjustedCooldownWasteSinceLastWasteCheck(timestamp: number): number {
    const currentHaste = this.haste.current;
    return (timestamp - this.lastCooldownWasteCheck) * (1 + currentHaste);
  }

  private get guideSpell() {
    return this.hasAscendance
      ? TALENTS.ASCENDANCE_ENHANCEMENT_TALENT
      : this.hasDRE
        ? TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT
        : TALENTS.DOOM_WINDS_TALENT;
  }

  private getUnusedGlobalCooldowns(cast: DoomWindsCooldownCast) {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    return Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
  }

  private getCrashLightningCasts(cast: DoomWindsCooldownCast) {
    return cast.timeline.events.filter(
      (event) =>
        event.type === EventType.Cast && event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id,
    ).length;
  }

  private getMissedCrashLightningCasts(cast: DoomWindsCooldownCast): number {
    return Math.floor(cast.hasteAdjustedWastedCrashLightningCooldown / this.crashLightningCD);
  }

  private getThorimsTriggerOpportunityBreakdown(cast: DoomWindsCooldownCast) {
    const primaryCasts = cast.timeline.events.filter(
      (event) => event.type === EventType.Cast && event.ability.guid === cast.primarySpellId,
    ).length;
    const missedPrimaryCasts = this.getMissedWindstrikes(cast);
    const crashLightningCasts = this.getCrashLightningCasts(cast);
    const missedCrashLightningCasts = this.getMissedCrashLightningCasts(cast);

    return {
      primaryCasts,
      missedPrimaryCasts,
      maximumPrimaryCasts: primaryCasts + missedPrimaryCasts,
      crashLightningCasts,
      missedCrashLightningCasts,
      maximumCrashLightningCasts: crashLightningCasts + missedCrashLightningCasts,
      estimatedMaximumTriggers:
        primaryCasts + missedPrimaryCasts + crashLightningCasts + missedCrashLightningCasts,
    };
  }

  private buildSpellSequence(cast: DoomWindsCooldownCast): CastInSequence[] {
    return cast.timeline.events
      .filter((event): event is CastEvent => event.type === EventType.Cast)
      .map((event) => ({
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

  private buildPerCastData(): PerCastData[] {
    return this.casts.map((cast) => {
      const spellUse = this.explainPerformance(cast);
      const thorimsTriggerCounts = this.getThorimsTriggerStats(cast);
      const triggerOpportunities = this.getThorimsTriggerOpportunityBreakdown(cast);
      const thorimsPerformance = this.unifiedTriggerPerformance(cast);
      const unusedGlobalCooldowns = this.getUnusedGlobalCooldowns(cast);
      const sequence = this.buildSpellSequence(cast);

      return {
        performance: spellUse.performance,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        stats: [
          {
            value: cast.windowSource === 'deeply-rooted-elements' ? 'Proc' : 'Cast',
            label: 'Source',
            tooltip: <>{this.explainSource(cast).details}</>,
            performance: this.explainSource(cast).performance,
          },
          {
            value: `${thorimsTriggerCounts.total}/${triggerOpportunities.estimatedMaximumTriggers}`,
            label: 'Thorim Triggers',
            tooltip: (
              <>
                <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> triggers compared to the
                estimated maximum:
                <ul>
                  <li>
                    <SpellLink spell={this.getPrimaryStrikeSpell(cast)} />:{' '}
                    {triggerOpportunities.primaryCasts}/{triggerOpportunities.maximumPrimaryCasts}
                  </li>
                  {triggerOpportunities.maximumCrashLightningCasts > 0 && (
                    <li>
                      <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} />:{' '}
                      {triggerOpportunities.crashLightningCasts}/
                      {triggerOpportunities.maximumCrashLightningCasts}
                    </li>
                  )}
                </ul>
              </>
            ),
            performance: thorimsPerformance.performance,
          },
          {
            value: `${unusedGlobalCooldowns}`,
            label: 'Unused GCDs',
            tooltip: <>Estimated unused global cooldowns during this window.</>,
            performance: this.explainGcdPerformance(cast).performance,
          },
        ],
        additionalContent:
          sequence.length > 0
            ? {
                title: 'Cast Sequence',
                content: <SpellSequence casts={sequence} iconSize={40} />,
              }
            : undefined,
      };
    });
  }

  description(): JSX.Element {
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
              <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />,
            </>
          ) : null}
          {this.hasDRE ? (
            <>
              {' '}
              or <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> procs,
            </>
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
        {this.hasAscendance || this.hasDRE ? (
          <p>
            During windows with <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
            effects, <SpellLink spell={SPELLS.STORMSTRIKE} /> is replaced by{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />. When combined with{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />, each{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> cast will almost always reset its own
            cooldown.
          </p>
        ) : null}
      </>
    );
  }

  getMissedWindstrikes(cast: DoomWindsCooldownCast): number {
    return Math.floor(cast.hasteAdjustedWastedCooldown / 3000);
  }

  private getPrimaryStrikeSpell(cast: DoomWindsCooldownCast) {
    return cast.windowSource === 'doom-winds' ? SPELLS.STORMSTRIKE : SPELLS.WINDSTRIKE_CAST;
  }

  private getThorimsTriggerStats(cast: DoomWindsCooldownCast): ThorimsTriggerStats {
    const triggerAttempts = cast.timeline.events.filter(
      (event): event is CastEvent =>
        event.type === EventType.Cast &&
        (event.ability.guid === cast.primarySpellId ||
          event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id),
    );

    const stats: ThorimsTriggerStats = {
      attempts: triggerAttempts.length,
      total: 0,
      windstrike: 0,
      stormstrike: 0,
      crashLightning: 0,
    };

    for (const event of triggerAttempts) {
      const freeCast = GetRelatedEvent<FreeCastEvent>(
        event,
        EnhancementEventLinks.THORIMS_INVOCATION_LINK,
        (relatedEvent) => relatedEvent.type === EventType.FreeCast,
      );
      if (!freeCast) {
        continue;
      }

      const damageEvents = GetRelatedEvents<DamageEvent>(
        freeCast,
        EnhancementEventLinks.THORIMS_INVOCATION_DAMAGE_LINK,
        (relatedEvent) => relatedEvent.type === EventType.Damage,
      );
      if (damageEvents.length === 0) {
        continue;
      }

      stats.total += 1;

      if (event.ability.guid === SPELLS.WINDSTRIKE_CAST.id) {
        stats.windstrike += 1;
      } else if (event.ability.guid === SPELLS.STORMSTRIKE.id) {
        stats.stormstrike += 1;
      } else if (event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id) {
        stats.crashLightning += 1;
      }
    }

    return stats;
  }

  private unifiedTriggerPerformance(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const counts = this.getThorimsTriggerStats(cast);
    const opportunities = this.getThorimsTriggerOpportunityBreakdown(cast);
    const triggerRate =
      opportunities.estimatedMaximumTriggers === 0
        ? 1
        : counts.total / opportunities.estimatedMaximumTriggers;

    return {
      check: 'thorims-trigger-opportunities',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: triggerRate,
        isGreaterThanOrEqual: {
          perfect: 1,
          good: 0.8,
          ok: 0.6,
        },
      }),
      summary: (
        <div>
          <strong>{formatNumber(counts.total)}</strong> /{' '}
          <strong>{formatNumber(opportunities.estimatedMaximumTriggers)}</strong> potential{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> triggers
        </div>
      ),
      details: (
        <div>
          Confirmed <strong>{formatNumber(counts.total)}</strong>{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> trigger(s) out of an estimated{' '}
          <strong>{formatNumber(opportunities.estimatedMaximumTriggers)}</strong> trigger-eligible
          cast(s).
          <div>
            <SpellLink spell={this.getPrimaryStrikeSpell(cast)} />:{' '}
            <strong>{formatNumber(opportunities.primaryCasts)}</strong> /{' '}
            <strong>{formatNumber(opportunities.maximumPrimaryCasts)}</strong>
          </div>
          <div>
            <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} />:{' '}
            <strong>{formatNumber(opportunities.crashLightningCasts)}</strong> /{' '}
            <strong>{formatNumber(opportunities.maximumCrashLightningCasts)}</strong>
          </div>
        </div>
      ),
    };
  }

  private explainTimelineWithDetails(cast: DoomWindsCooldownCast) {
    const extraDetails = (
      <div
        style={{
          overflowX: 'scroll',
        }}
      >
        <EmbeddedTimelineContainer
          secondWidth={60}
          secondsShown={(cast.timeline.end! - cast.timeline.start) / 1000}
        >
          <SpellTimeline>
            <Casts
              start={cast.timeline.start}
              movement={undefined}
              secondWidth={60}
              events={cast.timeline.events}
            />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </div>
    );

    return extraDetails;
  }

  private getAverageGcdOfWindow(cast: DoomWindsCooldownCast) {
    return (
      cast.globalCooldowns.reduce((t, gcdDuration) => (t += gcdDuration + GCD_TOLERANCE), 0) /
      (cast.globalCooldowns.length ?? 1)
    );
  }

  private explainGcdPerformance(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    const unusedGlobalCooldowns = Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
    const estimatedPotentialCasts = (cast.timeline.end! - cast.timeline.start) / avgGcd;
    const gcdPerfCalc = (unusedGlobalCooldowns / estimatedPotentialCasts) * 100;

    return {
      check: 'global-cooldown',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: gcdPerfCalc,
        isLessThanOrEqual: {
          perfect: 7.5,
          good: 15,
          ok: 25,
        },
      }),
      details: (
        <div>
          {unusedGlobalCooldowns === 0 ? (
            'No unused global cooldowns'
          ) : (
            <>{unusedGlobalCooldowns} unused global cooldowns</>
          )}
          .
        </div>
      ),
      summary: (
        <>{cast.unusedGcdTime < 100 ? 'No unused global cooldowns' : 'Unused global cooldowns'} </>
      ),
    };
  }

  explainPerformance(cast: DoomWindsCooldownCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [
      this.explainSource(cast),
      this.explainGcdPerformance(cast),
      this.unifiedTriggerPerformance(cast),
    ];

    const actualPerformance =
      checklistItems.length > 0
        ? getLowestPerf(checklistItems.map((item) => item.performance))
        : QualitativePerformance.Perfect;

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: actualPerformance,
      extraDetails: this.explainTimelineWithDetails(cast),
    };
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

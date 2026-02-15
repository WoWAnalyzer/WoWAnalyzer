import type { JSX } from 'react';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FightEndEvent,
  GetRelatedEvents,
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
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { SpellLink, Tooltip } from 'interface';
import SPELLS from 'common/SPELLS';
import Abilities from '../Abilities';
import Haste from 'parser/shared/modules/Haste';
import { formatNumber } from 'common/format';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import {
  EmbeddedTimelineContainer,
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { MaelstromWeaponTracker } from 'analysis/retail/shaman/enhancement/modules/resourcetracker';
import { EnhancementEventLinks, GCD_TOLERANCE } from '../../constants';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import { getApplicableRules, HighPriorityAbilities } from '../../common';

type WindowSource = 'direct' | 'proc';

interface DoomWindsTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface DoomWindsCooldownCast extends CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent> {
  extraDamage: number;
  hasteAdjustedWastedCooldown: number;
  timeline: DoomWindsTimeline;
  unusedGcdTime: number;
  globalCooldowns: number[];
  windowSource: WindowSource;
  primarySpellId: number;
}

class DoomWinds extends MajorCooldown<DoomWindsCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    haste: Haste,
    spellUsable: SpellUsable,
    abilities: Abilities,
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  private readonly hasAscendance: boolean = false;
  private readonly hasDRE: boolean = false;

  // dependency properties
  protected haste!: Haste;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected maelstromWeaponTracker!: MaelstromWeaponTracker;

  protected activeWindow: DoomWindsCooldownCast | null = null;
  protected windstrikeOnCooldown = true;
  protected lastCooldownWasteCheck = 0;

  protected globalCooldownEnds = 0;

  // building these in constructor as rules need to reference msw tracker
  readonly ascendanceCastRules: HighPriorityAbilities = [];

  constructor(options: Options) {
    super({ spell: TALENTS.DOOM_WINDS_TALENT }, options);

    this.hasAscendance = this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT);
    this.hasDRE = this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DOOM_WINDS_TALENT);
    if (!this.active) {
      return;
    }

    const abilities = options.abilities as Abilities;
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

    // Usage within the cooldown window
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    if (this.hasAscendance || this.hasDRE) {
      // Doom Winds proc statistics are intentionally not tracked.
    }

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
      const hasAscendanceLike = this.hasAscendance || this.hasDRE;

      const windowSource: WindowSource = !hasAscendanceLike
        ? 'direct'
        : this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)
          ? 'direct'
          : 'proc';

      if (windowSource === 'proc') {
        // Intentionally not tracked: proc rules are too complex to model accurately.
      }

      const primarySpellId =
        windowSource === 'direct' ? SPELLS.WINDSTRIKE_CAST.id : SPELLS.STORMSTRIKE.id;
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
        globalCooldowns: [],
        unusedGcdTime: 0,
      };
    }
    this.lastCooldownWasteCheck = event.timestamp;
  }

  private explainSource(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const hasAscendanceLike = this.hasAscendance || this.hasDRE;

    const sourceSpell = !hasAscendanceLike
      ? TALENTS.DOOM_WINDS_TALENT
      : cast.windowSource === 'proc'
        ? this.hasDRE
          ? TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT
          : TALENTS.DOOM_WINDS_TALENT
        : TALENTS.ASCENDANCE_ENHANCEMENT_TALENT;

    return {
      check: 'source',
      timestamp: cast.event.timestamp,
      performance: QualitativePerformance.Perfect,
      summary: <SpellLink spell={sourceSpell} />,
      details: (
        <div>
          Source: <SpellLink spell={sourceSpell} />
        </div>
      ),
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

    if (
      !isPriorityCast &&
      this.spellUsable.isAvailable(primarySpellId) &&
      !this.isAllowedCastDuringWindow(event)
    ) {
      this.activeWindow.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
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
      this.activeWindow.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
      this.recordCooldown(this.activeWindow);
      this.activeWindow = null;
    }
  }

  hasteAdjustedCooldownWasteSinceLastWasteCheck(event: AnyEvent): number {
    const currentHaste = this.haste.current;
    return (event.timestamp - this.lastCooldownWasteCheck) * (1 + currentHaste);
  }

  description(): JSX.Element {
    const hasAscendanceLike = this.hasAscendance || this.hasDRE;

    if (!hasAscendanceLike) {
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
          During{' '}
          <strong>
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} />
          </strong>
          {', '}
          <SpellLink spell={SPELLS.STORMSTRIKE} /> and{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> are top priority due to{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> spending{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />.
        </p>
        {hasAscendanceLike ? (
          <p>
            During <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />,{' '}
            <SpellLink spell={SPELLS.STORMSTRIKE} /> is replaced with{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />. When combined with{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />, each cast will almost always reset
            it's own cooldown.
          </p>
        ) : null}
      </>
    );
  }

  getMissedWindstrikes(cast: DoomWindsCooldownCast): number {
    return Math.floor(cast.hasteAdjustedWastedCooldown / 3000);
  }

  private getPrimaryStrikeSpell(cast: DoomWindsCooldownCast) {
    return cast.windowSource === 'direct' ? SPELLS.WINDSTRIKE_CAST : SPELLS.STORMSTRIKE;
  }

  private getThorimsTriggerSpellCounts(cast: DoomWindsCooldownCast): {
    total: number;
    windstrike: number;
    stormstrike: number;
    crashLightning: number;
  } {
    const events = cast.timeline.events;

    let windstrike = 0;
    let stormstrike = 0;
    let crashLightning = 0;

    for (const event of events) {
      if (event.type !== EventType.Cast) {
        continue;
      }

      if (event.ability.guid === SPELLS.WINDSTRIKE_CAST.id) {
        windstrike += 1;
      } else if (event.ability.guid === SPELLS.STORMSTRIKE.id) {
        stormstrike += 1;
      } else if (event.ability.guid === TALENTS.CRASH_LIGHTNING_TALENT.id) {
        crashLightning += 1;
      }
    }

    return {
      total: windstrike + stormstrike + crashLightning,
      windstrike,
      stormstrike,
      crashLightning,
    };
  }

  private renderThorimsTriggersTooltipContent(cast: DoomWindsCooldownCast): JSX.Element {
    const counts = this.getThorimsTriggerSpellCounts(cast);

    if (counts.total === 0) {
      return <div>No triggers</div>;
    }

    return (
      <div>
        <p>
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> was triggered from the following
          spells:
        </p>
        <ul>
          {counts.windstrike > 0 ? (
            <li>
              <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />:{' '}
              <strong>{formatNumber(counts.windstrike)}</strong>
            </li>
          ) : null}
          {counts.stormstrike > 0 ? (
            <li>
              <SpellLink spell={SPELLS.STORMSTRIKE} />:{' '}
              <strong>{formatNumber(counts.stormstrike)}</strong>
            </li>
          ) : null}
          {counts.crashLightning > 0 ? (
            <li>
              <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} />:{' '}
              <strong>{formatNumber(counts.crashLightning)}</strong>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }

  private strikePerformance(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const strikeCasts = cast.timeline.events.filter(
      (c) => c.type === EventType.Cast && c.ability.guid === cast.primarySpellId,
    ).length;
    const missedStrikes = this.getMissedWindstrikes(cast);
    const maximumNumberOfStrikesPossible = strikeCasts + missedStrikes;
    const castsAsPercentageOfMax = strikeCasts / maximumNumberOfStrikesPossible;

    const thorimsTriggerCounts = this.getThorimsTriggerSpellCounts(cast);
    const thorimsTriggerTooltip = this.renderThorimsTriggersTooltipContent(cast);

    return {
      check: cast.windowSource === 'direct' ? 'windstrike' : 'stormstrike',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: castsAsPercentageOfMax,
        isGreaterThanOrEqual: {
          perfect: 1,
          good: 0.8,
          ok: 0.6,
        },
      }),
      summary: (
        <div>
          <strong>{formatNumber(thorimsTriggerCounts.total)}</strong>{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> triggers
        </div>
      ),
      details: (
        <div>
          You had{' '}
          <Tooltip content={<div>{thorimsTriggerTooltip}</div>} hoverable direction="up">
            <dfn>
              <strong>{formatNumber(thorimsTriggerCounts.total)}</strong>
            </dfn>
          </Tooltip>{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> triggers.
        </div>
      ),
    };
  }

  windstrikePerformance(cast: DoomWindsCooldownCast): ChecklistUsageInfo {
    const windstrikesCasts = cast.timeline.events.filter(
      (c) => c.type === EventType.Cast && c.ability.guid === SPELLS.WINDSTRIKE_CAST.id,
    ).length;
    const missedWindstrikes = this.getMissedWindstrikes(cast);
    const maximumNumberOfWindstrikesPossible = windstrikesCasts + missedWindstrikes;
    const castsAsPercentageOfMax = windstrikesCasts / maximumNumberOfWindstrikesPossible;

    const windstrikeSummary = (
      <div>
        Cast {Math.floor(maximumNumberOfWindstrikesPossible * 0.85)}+{' '}
        <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
        (s) during window
      </div>
    );

    return {
      check: 'windstrike',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: castsAsPercentageOfMax,
        isGreaterThanOrEqual: {
          perfect: 1,
          good: 0.8,
          ok: 0.6,
        },
      }),
      summary: windstrikeSummary,
      details:
        missedWindstrikes === 0 ? (
          <div>
            You cast {windstrikesCasts} <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
            (s).
          </div>
        ) : (
          <div>
            You cast {windstrikesCasts} <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
            (s) when you could have cast {maximumNumberOfWindstrikesPossible}
          </div>
        ),
    };
  }

  thorimsInvocationPerformance(cast: DoomWindsCooldownCast): UsageInfo[] | undefined {
    const result: UsageInfo[] = [];
    const windstrikes = cast.timeline.events.filter(
      (c) => c.type === EventType.Cast && c.ability.guid === SPELLS.WINDSTRIKE_CAST.id,
    ) as CastEvent[];
    const thorimsInvocationFreeCasts = windstrikes.map((event) => {
      return GetRelatedEvents<DamageEvent>(
        event,
        EnhancementEventLinks.THORIMS_INVOCATION_LINK,
        (e) => e.type === EventType.Damage,
      );
    });

    const noMaelstromCasts = thorimsInvocationFreeCasts.filter((fc) => !fc).length;
    if (noMaelstromCasts) {
      result.push({
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            You cast <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> with no{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> {noMaelstromCasts} time(s).
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> has significantly lower priority when you
            have no stacks of <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
          </div>
        ),
      });
    }

    const chainLightningCastsWith1Hit = thorimsInvocationFreeCasts.filter((fc) => {
      if (fc) {
        return (
          fc.filter((de) => de.ability.guid === TALENTS.CHAIN_LIGHTNING_TALENT.id).length === 1
        );
      }
      return false;
    }).length;
    if (chainLightningCastsWith1Hit > 0) {
      result.push({
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> was primed with{' '}
            <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} />
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> cast
            <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> {chainLightningCastsWith1Hit}{' '}
            time(s) only hitting one target.
          </div>
        ),
      });
    }
    return result.length > 0 ? result : undefined;
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
      this.strikePerformance(cast),
    ];
    const thorimsInvocationPerformance = this.thorimsInvocationPerformance(cast);
    if (thorimsInvocationPerformance) {
      thorimsInvocationPerformance.forEach((item) => {
        checklistItems.push({
          check: 'thorims-invocation',
          timestamp: cast.event.timestamp,
          ...item,
        });
      });
    }

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

    const title = this.hasAscendance
      ? TALENTS.ASCENDANCE_ENHANCEMENT_TALENT
      : this.hasDRE
        ? TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT
        : TALENTS.DOOM_WINDS_TALENT;

    return (
      <>
        <CooldownUsage analyzer={this} title={<SpellLink spell={title} />} />
      </>
    );
  }
}

export default DoomWinds;

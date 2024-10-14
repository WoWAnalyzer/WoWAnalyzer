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
import { SpellIcon, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Abilities from '../Abilities';
import Haste from 'parser/shared/modules/Haste';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import Uptime from 'interface/icons/Uptime';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import { MaelstromWeaponTracker } from 'analysis/retail/shaman/enhancement/modules/resourcetracker';
import { EnhancementEventLinks, GCD_TOLERANCE } from '../../constants';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { addEnhancedCastReason, addInefficientCastReason } from 'parser/core/EventMetaLib';
import { getApplicableRules, HighPriorityAbilities } from '../../common';
import ElementalSpirits from './ElementalSpirits';

const SIMULATED_MEDIAN_CASTS_PER_DRE = 13;

interface StormstrikeCasts {
  count: number;
  noProcBeforeEnd?: boolean | undefined;
}

interface AscendanceTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface AscendanceCooldownCast
  extends CooldownTrigger<CastEvent | ApplyBuffEvent | RefreshBuffEvent> {
  extraDamage: number;
  hasteAdjustedWastedCooldown: number;
  timeline: AscendanceTimeline;
  unusedGcdTime: number;
  globalCooldowns: number[];
}

class Ascendance extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    haste: Haste,
    spellUsable: SpellUsable,
    abilities: Abilities,
    maelstromWeaponTracker: MaelstromWeaponTracker,
    elementalSpirits: ElementalSpirits,
  };

  // dependency properties
  protected haste!: Haste;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected maelstromWeaponTracker!: MaelstromWeaponTracker;
  protected elementalSpirits!: ElementalSpirits;

  protected activeWindow: AscendanceCooldownCast | null = null;
  protected windstrikeOnCooldown: boolean = true;
  protected lastCooldownWasteCheck: number = 0;

  protected castsBeforeAscendanceProc: StormstrikeCasts[] = [{ count: 0 }];
  protected globalCooldownEnds: number = 0;

  // building these in constructor as rules need to reference msw tracker and elemental spirits
  readonly ascendanceCastRules: HighPriorityAbilities = [];

  constructor(options: Options) {
    super({ spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT }, options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    const abilities = options.abilities as Abilities;
    abilities.add({
      spell: SPELLS.WINDSTRIKE_CAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 3 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
        maxCasts: () => this.maxCasts,
      },
    });

    this.ascendanceCastRules.push(
      TALENTS.FERAL_SPIRIT_TALENT.id,
      {
        spellId: SPELLS.TEMPEST_CAST.id,
        condition: (cast) =>
          getResourceCost(cast.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id) === 10,
        enhancedCastReason: (isvalid) =>
          isvalid && (
            <>
              Cast <SpellLink spell={TALENTS.TEMPEST_TALENT} /> available and at 10{' '}
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
            </>
          ),
      },
      {
        spellId: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        condition: (cast) => {
          const cost = getResourceCost(cast.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id) ?? 0;
          const elementalSpirits = this.elementalSpirits.elementalSpiritCount;
          return cost >= 8 && elementalSpirits >= 6;
        },
        enhancedCastReason: (isValid) =>
          isValid && (
            <>
              During <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />, cast{' '}
              <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> when you have at
              least 8 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> and 6{' '}
              <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} />
            </>
          ),
      },
    );

    if (this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onAscendanceCast,
      );
    } else {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onAscendanceCast,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        this.onAscendanceCast,
      );
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onAscendanceEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.detectWindstrikeCasts,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell([TALENTS.STORMSTRIKE_TALENT, SPELLS.WINDSTRIKE_CAST]),
        this.onProcEligibleCast,
      );
    }
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
    return this.casts.reduce(
      (total: number, cast: AscendanceCooldownCast) =>
        (total +=
          cast.timeline.events.filter(
            (c) => c.type === EventType.Cast && c.ability.guid === SPELLS.WINDSTRIKE_CAST.id,
          ).length + this.getMissedWindstrikes(cast)),
      0,
    );
  }

  /**
   * When Ascendance is cast, being recording the cooldown usage
   * @remarks
   * Deeply Rooted Elements appears as a fabricated cast
   */
  onAscendanceCast(event: CastEvent | ApplyBuffEvent | RefreshBuffEvent) {
    this.castsBeforeAscendanceProc.push({ count: 0 });
    if (!this.activeWindow) {
      this.activeWindow ??= {
        event: event,
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

  isValidCastDuringAscendance(event: CastEvent): boolean {
    const firstApplicableRule = getApplicableRules(event, this.ascendanceCastRules)?.at(0);

    if (firstApplicableRule) {
      if (typeof firstApplicableRule === 'object') {
        const isValidCast = !firstApplicableRule.condition || firstApplicableRule.condition(event);
        if (firstApplicableRule.enhancedCastReason) {
          const reason = firstApplicableRule.enhancedCastReason(isValidCast);
          if (reason) {
            const addReason = isValidCast ? addEnhancedCastReason : addInefficientCastReason;
            addReason(event, reason);
          }
        }
        return !isValidCast;
      } else {
        return firstApplicableRule === event.ability.guid;
      }
    }
    return true;
  }

  onCast(event: CastEvent) {
    if (
      !this.activeWindow ||
      [TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id, SPELLS.MELEE.id].includes(event.ability.guid) ||
      !event.globalCooldown
    ) {
      return;
    }

    this.activeWindow.unusedGcdTime += Math.max(event.timestamp - this.globalCooldownEnds, 0);
    if (
      (event.ability.guid !== SPELLS.WINDSTRIKE_CAST.id &&
        !this.isValidCastDuringAscendance(event)) ||
      this.spellUsable.isAvailable(SPELLS.WINDSTRIKE_CAST.id)
    ) {
      this.activeWindow.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
    }
    this.lastCooldownWasteCheck = event.timestamp;
    this.activeWindow!.timeline.events.push(event);
  }

  onDamage(event: DamageEvent) {
    if (this.activeWindow) {
      this.activeWindow.extraDamage += event.amount;
    }
  }

  onAscendanceEnd(event: AnyEvent) {
    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
      this.activeWindow.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
      this.recordCooldown(this.activeWindow);
      this.activeWindow = null;
    }
  }

  onProcEligibleCast(event: CastEvent) {
    this.castsBeforeAscendanceProc.at(-1)!.count += 1;
  }

  onFightEnd(event: FightEndEvent) {
    const cast = this.castsBeforeAscendanceProc.at(-1);
    if (cast) {
      cast.noProcBeforeEnd = true;
    }
    this.onAscendanceEnd(event);
  }

  hasteAdjustedCooldownWasteSinceLastWasteCheck(event: AnyEvent): number {
    const currentHaste = this.haste.current;
    return (event.timestamp - this.lastCooldownWasteCheck) * (1 + currentHaste);
  }

  description(): JSX.Element {
    return (
      <>
        <p>
          During{' '}
          <strong>
            <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
          </strong>{' '}
          <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> is top priority due to{' '}
          <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> spending{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />.
        </p>
        <p>
          To minimise <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> waste during{' '}
          <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />, you will most likely need to
          spend inbetween casts if <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> doesn't reset via{' '}
          <SpellLink spell={SPELLS.STORMBRINGER} />.
        </p>
        <p>
          An example sequence may look something like this:
          <br />
          <SpellIcon spell={SPELLS.WINDSTRIKE_CAST} /> &rarr;
          <SpellIcon spell={SPELLS.WINDSTRIKE_CAST} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={SPELLS.WINDSTRIKE_CAST} /> &rarr;
          <SpellIcon spell={TALENTS.TEMPEST_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.WINDSTRIKE_CAST} /> &rarr;
          <SpellIcon spell={TALENTS.FERAL_SPIRIT_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.WINDSTRIKE_CAST} />
        </p>
      </>
    );
  }

  getMissedWindstrikes(cast: AscendanceCooldownCast): number {
    return Math.floor(cast.hasteAdjustedWastedCooldown / 3000);
  }

  windstrikePerformance(cast: AscendanceCooldownCast): ChecklistUsageInfo {
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

  thorimsInvocationPerformance(cast: AscendanceCooldownCast): UsageInfo[] | undefined {
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

    // casts without any maelstrom are bad casts, only relevant for elementalist builds that pick the Ascendance talent rather than storm using DRE
    const noMaelstromCasts =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) &&
      thorimsInvocationFreeCasts.filter((fc) => !fc).length;
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

  private explainTimelineWithDetails(cast: AscendanceCooldownCast) {
    const checklistItem = {
      performance: QualitativePerformance.Perfect,
      summary: <span>Spell order</span>,
      details: <span>Spell order: See below</span>,
      check: 'ascendance-timeline',
      timestamp: cast.event.timestamp,
    };

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

    return { extraDetails, checklistItem };
  }

  private getAverageGcdOfWindow(cast: AscendanceCooldownCast) {
    return (
      cast.globalCooldowns.reduce((t, gcdDuration) => (t += gcdDuration + GCD_TOLERANCE), 0) /
      (cast.globalCooldowns.length ?? 1)
    );
  }

  private explainGcdPerformance(cast: AscendanceCooldownCast): ChecklistUsageInfo {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    const unsedGlobalCooldowns = Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
    const estimatedPotentialCasts = (cast.timeline.end! - cast.timeline.start) / avgGcd;
    const gcdPerfCalc = (unsedGlobalCooldowns / estimatedPotentialCasts) * 100;

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
        <>
          {unsedGlobalCooldowns === 0 ? (
            'No unused global cooldowns'
          ) : (
            <>{unsedGlobalCooldowns} unused global cooldowns</>
          )}
          .
        </>
      ),
      summary: (
        <>{cast.unusedGcdTime < 100 ? 'No unused global cooldowns' : 'Unused global cooldowns'} </>
      ),
    };
  }

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const thorimsInvocationPerformance = this.thorimsInvocationPerformance(cast);
    const timeline = this.explainTimelineWithDetails(cast);

    checklistItems.push(this.windstrikePerformance(cast), this.explainGcdPerformance(cast));

    if (thorimsInvocationPerformance) {
      thorimsInvocationPerformance.forEach((item) => {
        checklistItems.push({
          check: 'thorims-invocation',
          timestamp: cast.event.timestamp,
          ...item,
        });
      });
    }

    const actualPerformance = getLowestPerf(checklistItems.map((item) => item.performance));

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: actualPerformance,
      extraDetails: timeline.extraDetails,
    };
  }

  statistic() {
    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      // don't include casts that didn't lead to a proc in casts per proc statistic
      const castsBeforeAscendanceProc = this.castsBeforeAscendanceProc
        .filter((cast: StormstrikeCasts) => !cast.noProcBeforeEnd)
        .map((cast: StormstrikeCasts) => cast.count);
      const minToProc = Math.min(...castsBeforeAscendanceProc);
      const maxToProc = Math.max(...castsBeforeAscendanceProc);
      const median = getMedian(castsBeforeAscendanceProc)!;
      // do include them in overall casts to get the expected procs based on simulation results
      const totalCasts = this.castsBeforeAscendanceProc.reduce(
        (total, current: StormstrikeCasts) => (total += current.count),
        0,
      );
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL()}
          category={STATISTIC_CATEGORY.TALENTS}
          size="flexible"
          tooltip={
            <>
              <ul>
                <li>Min casts before proc: {minToProc}</li>
                <li>Max casts before proc: {maxToProc}</li>
                <li>Total casts: {totalCasts}</li>
                <li>Expected procs: {formatNumber(totalCasts / SIMULATED_MEDIAN_CASTS_PER_DRE)}</li>
              </ul>
            </>
          }
        >
          <TalentSpellText talent={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT}>
            <div>
              {formatNumber(median)} <small>casts per proc</small>
            </div>
            <div>
              {formatNumber(castsBeforeAscendanceProc.length)}{' '}
              <small>
                <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> procs
              </small>
            </div>
            <div>
              <Uptime />{' '}
              {formatPercentage(
                this.selectedCombatant.getBuffUptime(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id) /
                  this.owner.fightDuration,
                2,
              )}
              % <small>uptime</small>
            </div>
          </TalentSpellText>
        </Statistic>
      );
    }
  }

  get guideSubsection() {
    return (
      this.active && (
        <>
          <CooldownUsage
            analyzer={this}
            title={
              this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)
                ? 'Ascendance'
                : 'Deeply Rooted Elements'
            }
          />
        </>
      )
    );
  }
}

function getMedian(values: number[]): number | undefined {
  if (values.length > 0) {
    values.sort(function (a, b) {
      return a - b;
    });
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
      return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
  }
}

export default Ascendance;

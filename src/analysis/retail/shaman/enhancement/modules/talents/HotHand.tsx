import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellIcon, SpellLink } from 'interface';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  DeathEvent,
  EventType,
  FightEndEvent,
  GetRelatedEvent,
  GlobalCooldownEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { Intervals } from '../core/Intervals';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
} from 'parser/ui/QualitativePerformance';
import Abilities from '../Abilities';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { getApplicableRules, HighPriorityAbilities } from '../../common';
import { EnhancementEventLinks, GCD_TOLERANCE } from '../../constants';
import {
  addAdditionalCastInformation,
  addEnhancedCastReason,
  addInefficientCastReason,
} from 'parser/core/EventMetaLib';
import NPCS from 'common/NPCS';
import Earthsurge from '../hero/totemic/Earthsurge';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';

class HotHandRank {
  modRate: number;
  increase: number;

  constructor(modRate: number, increase: number) {
    this.modRate = modRate;
    this.increase = increase;
  }

  get rate() {
    return 1 / (1 - this.modRate);
  }
}

const HOT_HAND: Record<number, HotHandRank> = {
  1: new HotHandRank(0.6, 0.2),
  2: new HotHandRank(0.75, 0.4),
};

/**
 * These abilities are higher priority than casting Lava Lash even during
 * a Hot Hand window so we don't want to unfairly punish the performance if
 * any of these are used  */
const HIGH_PRIORITY_ABILITIES: HighPriorityAbilities = [
  SPELLS.SURGING_TOTEM.id,
  TALENTS.SUNDERING_TALENT.id,
];

interface HotHandTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface HotHandProc extends CooldownTrigger<ApplyBuffEvent> {
  hasteAdjustedWastedCooldown: number;
  timeline: HotHandTimeline;
  unusedGcdTime: number;
  globalCooldowns: number[];
  totemicMomentumExtension: number;
}

const TOTEMIC_MOMENTUM_EXTENSION_MS_PER_STACK = 200;

/**
 * Melee auto-attacks with Flametongue Weapon active have a 5% chance to
 * reduce the cooldown of Lava Lash by [25/50]% and increase the damage of
 * Lava Lash by [20/40]% for 8 sec.
 *
 * May not occur during an active Hot Hand.
 *
 * Example Log:
 *
 */
class HotHand extends MajorCooldown<HotHandProc> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    spellUsable: SpellUsable,
    haste: Haste,
    abilities: Abilities,
    earthsurge: Earthsurge,
  };
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;
  protected abilities!: Abilities;
  protected earthsurge!: Earthsurge;

  activeWindow: HotHandProc | null = null;
  globalCooldownEnds = 0;

  protected hotHand!: HotHandRank;
  protected buffedLavaLashDamage = 0;
  protected hotHandActive: Intervals = new Intervals();
  protected buffedCasts = 0;

  private hasTotemicMomentum = false;
  private totemicMomentumTotalExtension = 0;
  private totemicMomentumProcsForStats = 0;

  private lastCooldownWasteCheck = 0;

  protected hasEarthsurge = false;
  protected surgingTotemActive = false;

  private getTotemicMomentumPerformance(cast: HotHandProc) {
    if (!this.hasTotemicMomentum) {
      return QualitativePerformance.Perfect;
    }

    return cast.totemicMomentumExtension > 0
      ? QualitativePerformance.Perfect
      : QualitativePerformance.Ok;
  }

  constructor(options: Options) {
    super({ spell: TALENTS.HOT_HAND_TALENT }, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

    this.hasEarthsurge = this.selectedCombatant.hasTalent(TALENTS.EARTHSURGE_TALENT);
    this.hasTotemicMomentum = this.selectedCombatant.hasTalent(TALENTS.TOTEMIC_MOMENTUM_TALENT);
    this.hotHand = HOT_HAND[this.selectedCombatant.getTalentRank(TALENTS.HOT_HAND_TALENT)];

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.startWindow,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.removeHotHand,
    );
    this.addEventListener(Events.fightend, this.removeHotHand);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
      this.onLavaLashDamage,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
      this.detectLavaLashCasts,
    );
    if (this.hasEarthsurge) {
      const surgingTotemNpcId = this.owner.playerPets.find(
        (x) => x.guid === NPCS.SURGING_TOTEM.id,
      )?.id;

      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
        this.onLavaLashCast,
      );
      this.addEventListener(
        Events.summon.by(SELECTED_PLAYER).spell(SPELLS.SURGING_TOTEM),
        () => (this.surgingTotemActive = true),
      );
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), (event: DeathEvent) => {
        if (event.targetID === surgingTotemNpcId) {
          this.surgingTotemActive = false;
        }
      });
    }
  }

  detectLavaLashCasts(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.lastCooldownWasteCheck = event.timestamp;
    }
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;

    this.activeWindow?.timeline.events?.push(event);
    this.activeWindow?.globalCooldowns.push(event.duration);
  }

  startWindow(event: ApplyBuffEvent) {
    const whirlingFireRemovedEvent = GetRelatedEvent<RemoveBuffEvent>(
      event,
      EnhancementEventLinks.WHIRLING_FIRE_LINK,
      (e) => e.type === EventType.RemoveBuff,
    );

    // cooldown isn't reset if the Hot Hands stems from Whirling Fire
    if (!whirlingFireRemovedEvent) {
      this.spellUsable.endCooldown(TALENTS.LAVA_LASH_TALENT.id, event.timestamp);
    }

    if (!this.activeWindow) {
      this.spellUsable.applyCooldownRateChange(TALENTS.LAVA_LASH_TALENT.id, this.hotHand.rate);
      this.hotHandActive.startInterval(event.timestamp);

      // make sure to include first Lava Lash of the window, when triggered by Whirling Fire
      let lavaLashCastEvent: CastEvent | undefined;
      if (whirlingFireRemovedEvent) {
        lavaLashCastEvent = GetRelatedEvent<CastEvent>(
          whirlingFireRemovedEvent,
          EnhancementEventLinks.WHIRLING_FIRE_LINK,
          (e) => e.type === EventType.Cast,
        );
        lavaLashCastEvent &&
          addAdditionalCastInformation(
            lavaLashCastEvent,
            <>
              <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> was applied by{' '}
              <SpellLink spell={SPELLS.WHIRLING_FIRE} />
            </>,
          );
      }

      this.activeWindow = {
        event: event,
        timeline: {
          start: Math.max(event.timestamp, this.globalCooldownEnds),
          end: -1,
          events: [],
        },
        unusedGcdTime: 0,
        globalCooldowns: [],
        hasteAdjustedWastedCooldown: 0,
        totemicMomentumExtension: 0,
      };

      if (lavaLashCastEvent) {
        this.activeWindow.timeline.start = lavaLashCastEvent.timestamp;
        this.activeWindow.timeline.events.push(
          lavaLashCastEvent,
          lavaLashCastEvent.globalCooldown!,
        );
        this.activeWindow.globalCooldowns.push(lavaLashCastEvent.globalCooldown!.duration);
      }
    }
    this.lastCooldownWasteCheck = event.timestamp;
  }

  removeHotHand(event: RemoveBuffEvent | FightEndEvent) {
    this.spellUsable.removeCooldownRateChange(TALENTS.LAVA_LASH_TALENT.id, this.hotHand.rate);

    this.hotHandActive.endInterval(event.timestamp);

    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;

      // Exclude truncated windows (fight end) from Totemic Momentum statistics.
      if (
        this.hasTotemicMomentum &&
        event.type !== EventType.FightEnd &&
        this.activeWindow.totemicMomentumExtension > 0
      ) {
        this.totemicMomentumTotalExtension += this.activeWindow.totemicMomentumExtension;
        this.totemicMomentumProcsForStats += 1;
      }

      this.recordCooldown(this.activeWindow);
      this.activeWindow = null;
    }
  }

  isValidCastDuringHotHand(event: CastEvent): boolean {
    const firstApplicableRule = getApplicableRules(event, HIGH_PRIORITY_ABILITIES)?.at(0);

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
    if (!this.activeWindow || event.ability.guid === SPELLS.MELEE.id || !event.globalCooldown) {
      return;
    }

    if (this.hasTotemicMomentum) {
      const stacksSpent = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
      if (stacksSpent && stacksSpent > 0) {
        this.activeWindow.totemicMomentumExtension +=
          stacksSpent * TOTEMIC_MOMENTUM_EXTENSION_MS_PER_STACK;
      }
    }

    this.activeWindow.unusedGcdTime += Math.max(event.timestamp - this.globalCooldownEnds, 0);
    if (
      (event.ability.guid !== TALENTS.LAVA_LASH_TALENT.id &&
        !this.isValidCastDuringHotHand(event)) ||
      this.spellUsable.isAvailable(TALENTS.LAVA_LASH_TALENT.id)
    ) {
      this.activeWindow.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
    }
    this.lastCooldownWasteCheck = event.timestamp;
    this.activeWindow.timeline.events.push(event);
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.buffedCasts += 1;
    this.buffedLavaLashDamage += calculateEffectiveDamage(event, this.hotHand.increase);
  }

  onLavaLashCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF) && !this.surgingTotemActive) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.SURGING_TOTEM_TALENT} /> was not active!
        </>,
      );
    }
  }

  get timePercentageHotHandsActive() {
    return this.hotHandActive.totalDuration / this.owner.fightDuration;
  }

  get castsPerSecond() {
    return this.buffedCasts / this.hotHandActive.intervalsCount;
  }

  description(): ReactNode {
    const hh = <SpellLink spell={TALENTS.HOT_HAND_TALENT} />;
    const ll = <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />;
    return (
      <>
        <p>
          When <strong>{hh}</strong> triggers, you can usually cast {ll} in a 1 &rarr; 2 &rarr; 2
          &rarr; 1 like sequence. Casting {ll} &rarr; consuming 10 stacks of{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> can allow you to cast {ll} without an
          additional filler spell.
          <br />
          The section to the right shows breakdown of each time {hh} procced, and how well you
          utilised the window.
        </p>
        <p>
          With <SpellLink spell={TALENTS.SPLITSTREAM_TALENT} /> talented, each {ll} cast while {hh}{' '}
          is active will cast a <SpellLink spell={TALENTS.SUNDERING_TALENT} /> in the direction you
          are facing.{' '}
          {this.selectedCombatant.hasTalent(TALENTS.EARTHSURGE_TALENT) ? (
            <>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> cast by {ll} will also trigger an{' '}
              <SpellLink spell={TALENTS.EARTHSURGE_TALENT} /> half way along{' '}
              <SpellLink spell={TALENTS.SUNDERING_TALENT} />
              's path.
            </>
          ) : null}
        </p>
        <p>
          An example sequence may look something like this:
          <br />
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={SPELLS.STORMSTRIKE} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.CRASH_LIGHTNING_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} />
        </p>
        {this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
        this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT) ? (
          <>
            <p>
              During <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />, due to the short
              cooldown of <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> and the flood of maelstrom,
              you may find you are unable to cast <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />{' '}
              much or even at all.
            </p>
          </>
        ) : null}
      </>
    );
  }

  hasteAdjustedCooldownWasteSinceLastWasteCheck(event: AnyEvent): number {
    const currentHaste = this.haste.current;
    return (event.timestamp - this.lastCooldownWasteCheck) * (1 + currentHaste);
  }

  private getUnusedGlobalCooldowns(cast: HotHandProc) {
    const avgGcd = this.getAverageGcdOfWindow(cast);
    return Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
  }

  private buildOverviewStats() {
    const avgTotemicMomentumExtension =
      this.totemicMomentumProcsForStats > 0
        ? this.totemicMomentumTotalExtension / this.totemicMomentumProcsForStats
        : 0;

    const stats = [
      {
        value: `${this.casts.length}`,
        label: 'Total Procs',
        tooltip: <>Total Hot Hand windows recorded during the encounter.</>,
      },
      {
        value: `${formatPercentage(this.timePercentageHotHandsActive)}%`,
        label: 'Buff Uptime',
        tooltip: <>Percentage of the fight spent with Hot Hand active.</>,
      },
      {
        value: this.hotHandActive.intervalsCount > 0 ? this.castsPerSecond.toFixed(2) : '0.00',
        label: 'Avg Lava Lashes',
        tooltip: <>Average number of Lava Lash casts made during each Hot Hand proc.</>,
      },
    ];

    if (this.hasTotemicMomentum) {
      stats.push({
        value: formatDurationMillisMinSec(avgTotemicMomentumExtension, 1),
        label: 'Avg TM Extension',
        tooltip: <>Average Totemic Momentum extension gained during completed Hot Hand windows.</>,
      });
    }

    return stats;
  }

  private buildSpellSequence(cast: HotHandProc): CastInSequence[] {
    return cast.timeline.events
      .filter((event): event is CastEvent => event.type === EventType.Cast)
      .map((event) => ({
        timestamp: event.timestamp,
        spellId: event.ability.guid,
        spellName: event.ability.name,
        icon: event.ability.abilityIcon.replace('.jpg', ''),
        performance:
          event.ability.guid === TALENTS.LAVA_LASH_TALENT.id
            ? QualitativePerformance.Perfect
            : QualitativePerformance.Ok,
        tooltip: (
          <>
            <strong>{event.ability.name}</strong>
            <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
          </>
        ),
      }));
  }

  private buildPerCastData(): PerCastData[] {
    return this.casts.map((cast) => {
      const lavaLashCasts = cast.timeline.events.filter(
        (event) =>
          event.type === EventType.Cast && event.ability.guid === TALENTS.LAVA_LASH_TALENT.id,
      ).length;
      const missedLavaLashes = this.getMissedLavaLashes(cast);
      const maximumNumberOfLavaLashesPossible = lavaLashCasts + missedLavaLashes;
      const unusedGlobalCooldowns = this.getUnusedGlobalCooldowns(cast);
      const spellUse = this.explainPerformance(cast);
      const sequence = this.buildSpellSequence(cast);

      return {
        performance: spellUse.performance,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        detailsIcon: null,
        stats: [
          {
            value: `${lavaLashCasts}/${maximumNumberOfLavaLashesPossible}`,
            label: 'Lava Lash',
            tooltip: (
              <>
                <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> casts during this{' '}
                <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> compared with the estimated maximum.
              </>
            ),
            performance: this.explainUsagePerformance(cast).performance,
          },
          {
            value: `${unusedGlobalCooldowns}`,
            label: 'Unused GCDs',
            tooltip: (
              <>
                Estimated unused global cooldowns during this{' '}
                <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> window.
              </>
            ),
            performance: this.explainGcdPerformance(cast).performance,
          },
          {
            value: formatDurationMillisMinSec(cast.totemicMomentumExtension, 1),
            label: 'Extension Time',
            tooltip: (
              <>
                <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> extension accumulated during
                this <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> window.
              </>
            ),
            performance: this.getTotemicMomentumPerformance(cast),
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

  private explainTimelineWithDetails(cast: HotHandProc): ChecklistUsageInfo {
    const checklistItem = {
      performance: QualitativePerformance.Perfect,
      summary: this.hasTotemicMomentum ? (
        <>
          {cast.totemicMomentumExtension > 0
            ? formatDurationMillisMinSec(cast.totemicMomentumExtension, 1)
            : '0.0s'}{' '}
          <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> extension
        </>
      ) : null,
      details: this.hasTotemicMomentum ? (
        <>
          {cast.totemicMomentumExtension > 0 ? (
            <div>
              <strong>{formatDurationMillisMinSec(cast.totemicMomentumExtension, 1)}</strong>{' '}
              extension from <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} />.
            </div>
          ) : (
            <div>
              No <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> extension during this window.
            </div>
          )}
        </>
      ) : null,
      check: 'hothand-timeline',
      timestamp: cast.event.timestamp,
    };

    return checklistItem;
  }

  getMissedLavaLashes(cast: HotHandProc): number {
    return Math.floor(cast.hasteAdjustedWastedCooldown / 3000);
  }

  private explainUsagePerformance(cast: HotHandProc): ChecklistUsageInfo {
    const lavaLashCasts = cast.timeline.events.filter(
      (event) =>
        event.type === EventType.Cast && event.ability.guid === TALENTS.LAVA_LASH_TALENT.id,
    ).length;

    const missedLavaLashes = this.getMissedLavaLashes(cast);
    const maximumNumberOfLavaLashesPossible = lavaLashCasts + missedLavaLashes;
    const castsAsPercentageOfMax = lavaLashCasts / maximumNumberOfLavaLashesPossible;

    const lavaLashSummary = (
      <div>
        Cast {Math.floor(maximumNumberOfLavaLashesPossible * 0.85)}+{' '}
        <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />
        (s) during window
      </div>
    );

    return {
      check: 'lava-lash',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: castsAsPercentageOfMax,
        isGreaterThanOrEqual: {
          perfect: 1,
          good: 0.8,
          ok: 0.6,
        },
      }),
      summary: lavaLashSummary,
      details: (
        <>
          {missedLavaLashes === 0 ? (
            <>
              You cast {lavaLashCasts} <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />
              (s).
            </>
          ) : (
            <>
              You cast {lavaLashCasts} <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />
              (s) when you could have cast {maximumNumberOfLavaLashesPossible}
            </>
          )}
        </>
      ),
    };
  }

  private getAverageGcdOfWindow(cast: HotHandProc) {
    return (
      cast.globalCooldowns.reduce((t, gcdDuration) => (t += gcdDuration + GCD_TOLERANCE), 0) /
      (cast.globalCooldowns.length ?? 1)
    );
  }

  private explainGcdPerformance(cast: HotHandProc): ChecklistUsageInfo {
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
        <>
          <div>
            {unusedGlobalCooldowns === 0 ? (
              'No unused global cooldowns'
            ) : (
              <>
                <strong>{unusedGlobalCooldowns}</strong> unused global cooldowns
              </>
            )}
            .
          </div>
        </>
      ),
      summary: (
        <>{cast.unusedGcdTime < 100 ? 'No unused global cooldowns' : 'Unused global cooldowns'} </>
      ),
    };
  }

  explainPerformance(cast: HotHandProc): SpellUse {
    const usage = this.explainTimelineWithDetails(cast);

    const checklistItems = [
      usage,
      this.explainUsagePerformance(cast),
      this.explainGcdPerformance(cast),
    ];
    if (this.selectedCombatant.hasTalent(TALENTS.EARTHSURGE_TALENT)) {
      const slipstreamMissedSunderings = cast.timeline.events.filter(
        (event) =>
          event.type === EventType.Cast &&
          event.ability.guid === TALENTS.LAVA_LASH_TALENT.id &&
          this.earthsurge.isInefficientLavaLashCast(event),
      ).length;

      if (slipstreamMissedSunderings > 0) {
        checklistItems.push({
          check: 'slipstream',
          timestamp: cast.event.timestamp,
          performance: evaluateQualitativePerformanceByThreshold({
            actual: slipstreamMissedSunderings,
            isLessThanOrEqual: {
              perfect: 0,
              ok: 1,
            },
          }),
          summary: (
            <>
              One or more missed <SpellLink spell={TALENTS.SPLITSTREAM_TALENT} />{' '}
              <SpellLink spell={TALENTS.SUNDERING_TALENT} />
              's missed.
            </>
          ),
          details: (
            <>
              <div>
                <strong>{slipstreamMissedSunderings}</strong>{' '}
                <SpellLink spell={TALENTS.SUNDERING_TALENT} /> failed to hit any targets. Make sure
                you are facing the target when you cast{' '}
                <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />.
              </div>
            </>
          ),
        });
      }
    }

    return {
      event: cast.event,
      performance: getLowestPerf(checklistItems.map((x) => x.performance)),
      checklistItems: checklistItems,
    };
  }

  statistic() {
    const avgTotemicMomentumExtension =
      this.totemicMomentumProcsForStats > 0
        ? this.totemicMomentumTotalExtension / this.totemicMomentumProcsForStats
        : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <ul>
            <li>
              Gained buff {this.hotHandActive.intervalsCount} times (
              {formatPercentage(this.timePercentageHotHandsActive)}% uptime)
            </li>
            <li>
              {this.buffedCasts} total <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> casts with Hot
              Hand buff
            </li>
            {this.hasTotemicMomentum && this.totemicMomentumProcsForStats > 0 && (
              <li>
                <SpellLink spell={TALENTS.TOTEMIC_MOMENTUM_TALENT} /> average extension:{' '}
                {formatDurationMillisMinSec(avgTotemicMomentumExtension, 1)} per proc
              </li>
            )}
          </ul>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.HOT_HAND_TALENT}>
          <>
            <ItemDamageDone amount={this.buffedLavaLashDamage} />
            <br />
            {this.castsPerSecond.toFixed(2)} <small>average casts per proc</small>
            <br />
            {this.hasTotemicMomentum && this.totemicMomentumProcsForStats > 0 && (
              <>
                {formatDurationMillisMinSec(avgTotemicMomentumExtension, 1)}{' '}
                <small>average extension per proc</small>
                <br />
              </>
            )}
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  get guideSubsection() {
    if (!this.active) {
      return null;
    }

    return (
      <GuideSection spell={TALENTS.HOT_HAND_TALENT} explanation={this.description()}>
        <CastOverview spell={TALENTS.HOT_HAND_TALENT} stats={this.buildOverviewStats()} />
        <CastDetail title="Hot Hand Windows" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }
}

export default HotHand;

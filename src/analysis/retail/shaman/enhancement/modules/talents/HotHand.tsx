import { formatPercentage } from 'common/format';
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
  GlobalCooldownEvent,
  RefreshBuffEvent,
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
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { getApplicableRules, HighPriorityAbilities } from '../../common';
import { GCD_TOLERANCE } from '../../constants';
import { addEnhancedCastReason, addInefficientCastReason } from 'parser/core/EventMetaLib';
import NPCS from 'common/NPCS';
import Reactivity from '../hero/totemic/Reactivity';

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
  TALENTS.PRIMORDIAL_WAVE_TALENT.id,
  TALENTS.PRIMORDIAL_STORM_TALENT.id,
  TALENTS.FERAL_SPIRIT_TALENT.id,
  {
    spellId: [TALENTS.TEMPEST_TALENT.id, TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id],
    condition: (e) =>
      e.resourceCost !== undefined && e.resourceCost[RESOURCE_TYPES.MAELSTROM_WEAPON.id] >= 6,
  },
  {
    spellId: SPELLS.LIGHTNING_BOLT.id,
    condition: (e) =>
      e.resourceCost !== undefined && e.resourceCost[RESOURCE_TYPES.MAELSTROM_WEAPON.id] >= 5,
  },
];

interface HotHandTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface HotHandProc extends CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent> {
  hasteAdjustedWastedCooldown: number;
  timeline: HotHandTimeline;
  unusedGcdTime: number;
  globalCooldowns: number[];
}

/**
 * Melee auto-attacks with Flametongue Weapon active have a 5% chance to
 * reduce the cooldown of Lava Lash by [60/75]% and increase the damage of
 * Lava Lash by [20/40]% for 8 sec.
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
    reactivity: Reactivity,
  };
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;
  protected abilities!: Abilities;
  protected reactivity!: Reactivity;

  activeWindow: HotHandProc | null = null;
  globalCooldownEnds: number = 0;

  protected hotHand!: HotHandRank;
  protected buffedLavaLashDamage: number = 0;
  protected hotHandActive: Intervals = new Intervals();
  protected buffedCasts: number = 0;

  private lavaLashOnCooldown: boolean = true;
  private lastCooldownWasteCheck: number = 0;

  protected hasReactivity: boolean = false;
  protected surgingTotemActive: boolean = false;

  constructor(options: Options) {
    super({ spell: TALENTS.HOT_HAND_TALENT }, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

    this.hasReactivity = this.selectedCombatant.hasTalent(TALENTS.REACTIVITY_TALENT);
    this.hotHand = HOT_HAND[this.selectedCombatant.getTalentRank(TALENTS.HOT_HAND_TALENT)];

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.startOrRefreshWindow,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.startOrRefreshWindow,
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
    if (this.hasReactivity) {
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
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      this.lavaLashOnCooldown = true;
    }
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.lavaLashOnCooldown = false;
      this.lastCooldownWasteCheck = event.timestamp;
    }
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;

    this.activeWindow?.timeline.events?.push(event);
    this.activeWindow?.globalCooldowns.push(event.duration);
  }

  startOrRefreshWindow(event: ApplyBuffEvent | RefreshBuffEvent) {
    // on application both resets the CD and applies a mod rate
    this.spellUsable.endCooldown(TALENTS.LAVA_LASH_TALENT.id, event.timestamp);

    if (!this.activeWindow) {
      this.spellUsable.applyCooldownRateChange(TALENTS.LAVA_LASH_TALENT.id, this.hotHand.rate);
      this.hotHandActive.startInterval(event.timestamp);

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
      };
    }
    this.lastCooldownWasteCheck = event.timestamp;
  }

  removeHotHand(event: RemoveBuffEvent | FightEndEvent) {
    this.spellUsable.removeCooldownRateChange(TALENTS.LAVA_LASH_TALENT.id, this.hotHand.rate);

    this.hotHandActive.endInterval(event.timestamp);

    if (this.activeWindow) {
      this.activeWindow.timeline.end = event.timestamp;
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
          When <strong>{hh}</strong> triggers, you can cast {ll} as every other ability.
          <br />
          The section to the right shows breakdown of each time {hh} procced, and how well you
          utilised the window.
        </p>
        {this.selectedCombatant.hasTalent(TALENTS.REACTIVITY_TALENT) && (
          <>
            <p>
              With <SpellLink spell={TALENTS.REACTIVITY_TALENT} /> talented, each {ll} cast while{' '}
              {hh} is active will cast a <SpellLink spell={TALENTS.SUNDERING_TALENT} /> forward , so
              aiming is important, and your <SpellLink spell={TALENTS.SURGING_TOTEM_TALENT} /> will
              trigger an <SpellLink spell={TALENTS.EARTHSURGE_TALENT} />.
            </p>
            <p>
              For this reason, it is absolutely{' '}
              <i>
                <strong>critical</strong>
              </i>{' '}
              you have <SpellLink spell={TALENTS.SURGING_TOTEM_TALENT} /> active and near your
              target.
            </p>
          </>
        )}
        <p>
          An example sequence may look something like this:
          <br />
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={SPELLS.STORMSTRIKE_CAST} /> &rarr;
          <SpellIcon spell={TALENTS.LAVA_LASH_TALENT} /> &rarr;
          <SpellIcon spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> &rarr;
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

  private explainTimelineWithDetails(cast: HotHandProc): {
    extraDetails: ReactNode;
    checklistItem: ChecklistUsageInfo;
  } {
    const checklistItem = {
      performance: QualitativePerformance.Perfect,
      summary: null,
      details: null,
      check: 'hothand-timeline',
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
    const timeline = this.explainTimelineWithDetails(cast);

    const checklistItems = [
      timeline.checklistItem,
      this.explainUsagePerformance(cast),
      this.explainGcdPerformance(cast),
    ];
    if (this.selectedCombatant.hasTalent(TALENTS.REACTIVITY_TALENT)) {
      const reactivityMissedSunderings = cast.timeline.events.filter(
        (event) =>
          event.type === EventType.Cast &&
          event.ability.guid === TALENTS.LAVA_LASH_TALENT.id &&
          this.reactivity.isInefficientLavaLashCast(event),
      ).length;

      if (reactivityMissedSunderings > 0) {
        checklistItems.push({
          check: 'reactivity',
          timestamp: cast.event.timestamp,
          performance: evaluateQualitativePerformanceByThreshold({
            actual: reactivityMissedSunderings,
            isLessThanOrEqual: {
              perfect: 0,
              ok: 1,
            },
          }),
          summary: (
            <>
              One or more missed <SpellLink spell={TALENTS.REACTIVITY_TALENT} />{' '}
              <SpellLink spell={TALENTS.SUNDERING_TALENT} />
              's missed.
            </>
          ),
          details: (
            <>
              <div>
                <strong>{reactivityMissedSunderings}</strong>{' '}
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
      extraDetails: timeline.extraDetails,
    };
  }

  statistic() {
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
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  get guideSubsection() {
    return (
      this.active && (
        <>
          <CooldownUsage
            analyzer={this}
            title={
              <>
                <SpellLink spell={TALENTS.HOT_HAND_TALENT} />
              </>
            }
            castBreakdownSmallText
          />
        </>
      )
    );
  }
}

export default HotHand;

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FightEndEvent,
  FreeCastEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
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
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import Abilities from '../Abilities';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const GCD_TOLERANCE = 25;

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
  1: new HotHandRank(0.6, 0.4),
  2: new HotHandRank(0.75, 0.6),
};

interface HighPriorityRule {
  spellId: number;
  condition: (e: CastEvent | FreeCastEvent) => boolean;
}

/**
 * These abilities are higher priority than casting Lava Lash even during
 * a Hot Hand window so we don't want to unfairly punish the performance if
 * any of these are used  */
const HIGH_PRIORITY_ABILITIES: (number | HighPriorityRule)[] = [
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  TALENTS.FERAL_SPIRIT_TALENT.id,
  {
    spellId: TALENTS.TEMPEST_TALENT.id,
    condition: (e) =>
      e.resourceCost !== undefined && e.resourceCost[RESOURCE_TYPES.MAELSTROM_WEAPON.id] >= 8,
  },
  {
    spellId: SPELLS.LIGHTNING_BOLT.id,
    condition: (e) =>
      e.resourceCost !== undefined && e.resourceCost[RESOURCE_TYPES.MAELSTROM_WEAPON.id] === 10,
  },
];

interface HotHandTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface HotHandProc extends CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent> {
  timeline: HotHandTimeline;
  hasMissedCasts: boolean;
  unusedGcdTime: number;
  globalCooldowns: number[];
  higherPriorityCasts: number;
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
  };
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;
  protected abilities!: Abilities;

  activeWindow: HotHandProc | null = null;
  globalCooldownEnds: number = 0;

  protected hotHand!: HotHandRank;
  protected buffedLavaLashDamage: number = 0;
  protected hotHandActive: Intervals = new Intervals();
  protected buffedCasts: number = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.HOT_HAND_TALENT }, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

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
        hasMissedCasts: false,
        unusedGcdTime: 0,
        globalCooldowns: [],
        higherPriorityCasts: 0,
      };
    }
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

  onCast(event: CastEvent) {
    if (this.activeWindow && event.ability.guid > SPELLS.MELEE.id) {
      this.activeWindow.unusedGcdTime += Math.max(event.timestamp - this.globalCooldownEnds, 0);
      this.activeWindow.timeline.events.push(event);
      if (
        event.ability.guid !== TALENTS.LAVA_LASH_TALENT.id &&
        this.spellUsable.isAvailable(TALENTS.LAVA_LASH_TALENT.id)
      ) {
        this.activeWindow.hasMissedCasts ||= true;
        if (this.isHighPriorityAbility(event)) {
          this.activeWindow.higherPriorityCasts += 1;
        }
      }
    }
  }

  isHighPriorityAbility(event: CastEvent) {
    return (
      HIGH_PRIORITY_ABILITIES.find((value) => {
        if (typeof value === 'number') {
          return event.ability.guid === value;
        }
        return event.ability.guid === value.spellId && value.condition(event);
      }) !== undefined
    );
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.buffedCasts += 1;
    this.buffedLavaLashDamage += calculateEffectiveDamage(event, this.hotHand.increase);
  }

  get timePercentageHotHandsActive() {
    return this.hotHandActive.totalDuration / this.owner.fightDuration;
  }

  get castsPerSecond() {
    return this.buffedCasts / this.hotHandActive.intervalsCount;
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.HOT_HAND_TALENT} />
          </strong>{' '}
          greatly increases the damage of <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> and
          significantly reduces it's cooldown. While active,{' '}
          <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> should be cast every other GCD with your
          regular rotation as fillers.
        </p>
      </>
    );
  }

  private explainTimelineWithDetails(cast: HotHandProc) {
    const checklistItem = {
      performance: QualitativePerformance.Perfect,
      summary: null,
      details: <span>Spell order: See below</span>,
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

  private explainUsagePerformance(cast: HotHandProc): ChecklistUsageInfo {
    const lavaLashCasts = cast.timeline.events.filter(
      (event) =>
        event.type === EventType.Cast && event.ability.guid === TALENTS.LAVA_LASH_TALENT.id,
    ).length;

    // if a cast was missed, estimate the number of casts possible by dividing the duration by average gcd and assume half could have been Lava Lash
    let estimatedMissedCasts = 0;
    if (cast.hasMissedCasts) {
      const noOfGcdsInWindow =
        (cast.timeline.end! - cast.timeline.start) / (this.getAverageGcdOfWindow(cast) ?? 1) + 1;
      estimatedMissedCasts = Math.max(
        Math.ceil(noOfGcdsInWindow / 2) - lavaLashCasts - cast.higherPriorityCasts,
        0,
      );
    }

    return {
      check: 'lava-lash-casts',
      timestamp: cast.event.timestamp,
      performance:
        estimatedMissedCasts === 0
          ? QualitativePerformance.Perfect
          : estimatedMissedCasts === 1
            ? QualitativePerformance.Good
            : estimatedMissedCasts === 2
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
      summary: (
        <span>
          {lavaLashCasts} <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> cast(s)
        </span>
      ),
      details: (
        <span>
          Cast <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> {lavaLashCasts} time(s)
          {estimatedMissedCasts > 0 ? (
            <> when you could have cast it {estimatedMissedCasts + lavaLashCasts} time(s)</>
          ) : (
            <></>
          )}
          .
        </span>
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
    const unsedGlobalCooldowns = Math.max(Math.floor(cast.unusedGcdTime / avgGcd), 0);
    const estimatedPotentialCasts = (cast.timeline.end! - cast.timeline.start) / avgGcd;
    const gcdPerfCalc = (unsedGlobalCooldowns / estimatedPotentialCasts) * 100;
    return {
      check: 'global-cooldown',
      timestamp: cast.event.timestamp,
      performance:
        gcdPerfCalc < 5
          ? QualitativePerformance.Perfect
          : unsedGlobalCooldowns < 10
            ? QualitativePerformance.Good
            : unsedGlobalCooldowns < 20
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail,
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

  explainPerformance(cast: HotHandProc): SpellUse {
    const timeline = this.explainTimelineWithDetails(cast);
    const usage = this.explainUsagePerformance(cast);
    const gcd = this.explainGcdPerformance(cast);

    return {
      event: cast.event,
      performance: getLowestPerf([
        usage.performance,
        timeline.checklistItem.performance,
        gcd.performance,
      ]),
      checklistItems: [usage, gcd, timeline.checklistItem],
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
          <CooldownUsage analyzer={this} title="Hot Hand" />
        </>
      )
    );
  }
}

export default HotHand;

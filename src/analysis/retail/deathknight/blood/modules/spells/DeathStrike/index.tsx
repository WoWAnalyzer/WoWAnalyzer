import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Problem } from 'interface/guide/components/ProblemList';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
import { BLOOD_SHIELD_ABSORBED_HIT } from '../BloodShield/normalizer';
import { DEATH_STRIKE_ABSORB_GEN, DEATH_STRIKE_HEAL } from './normalizer';

export enum DeathStrikeReason {
  /** Any other cast type. */
  Other,
  /** A cast that dumps runic power to avoid capping. */
  DumpRP,
  /** A cast that generates a blood shield that prevents death. */
  BloodShield,
  /** A cast that does a good amount of healing. */
  GoodHealing,
  /** A cast while at low health. May not do much healing. */
  LowHealth,
}

function isMeleeAttack(event: DamageEvent): boolean {
  // negative values encode magic autos
  return event.ability.guid === 1 || event.ability.guid < 0;
}

const GOOD_HIT_THRESHOLD = 0.2;
const LOW_HP_THRESHOLD = 0.35;
const FOLLOWUP_WINDOW = 6000;
// 1 rp = 10 in the event.
export const DUMP_RP_THRESHOLD = 850;
export const BLOOD_SHIELD_THRESHOLD = 0.7;

// double death strike checks
const DOUBLE_DS_WINDOW_MS = 3000;

type CastReason = {
  reason: DeathStrikeReason;
  cast: CastEvent;
  followupDamageTaken?: number;
  followupAbsorbedDamage?: number;
  hasFollowupMelee?: boolean;
  isDoubleCast: boolean;
};

type BSQueueEntry = {
  cast: CastReason;
  absorbGenerated: number;
  absorbRemaining: number;
};

type WithAmount<T> = T & {
  amount: number;
};

export type DeathStrikeProblem = Problem<
  CastReason & {
    runicPower: number;
    maxRunicPower: number;
    hitPoints: number;
    maxHitPoints: number;
  }
>;

function castProblem(data: CastReason, rp: RunicPowerTracker): DeathStrikeProblem['data'] {
  const rpData = rp.getResource(data.cast);

  const healEvent = GetRelatedEvent<HealEvent>(data.cast, DEATH_STRIKE_HEAL);

  return {
    ...data,
    runicPower: rpData?.amount ?? 0,
    maxRunicPower: rpData?.max ?? 125,
    hitPoints: healEvent ? healEvent.hitPoints - healEvent.amount : Infinity,
    maxHitPoints: healEvent?.maxHitPoints ?? Infinity,
  };
}

export default class DeathStrike extends Analyzer {
  static dependencies = {
    rp: RunicPowerTracker,
  };

  protected rp!: RunicPowerTracker;

  readonly casts: CastReason[] = [];

  private _totalHealing: number = 0;

  private bloodShieldQueue: BSQueueEntry[] = [];
  private lastKnownMaxHp: number | undefined = undefined;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.spell(talents.DEATH_STRIKE_TALENT), this.onCast);

    this.addEventListener(Events.heal.spell(SPELLS.DEATH_STRIKE_HEAL), this.recordHeal);
    this.addEventListener(Events.absorbed.spell(SPELLS.BLOOD_SHIELD), this.recordAbsorb);
    this.addEventListener(Events.removebuff.spell(SPELLS.BLOOD_SHIELD), this.clearBloodShield);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamageTaken);
    this.addEventListener(Events.fightend, this.finalizeCastReasons);
  }

  private clearBloodShield() {
    this.bloodShieldQueue = [];
  }

  get totalHealing(): number {
    return this._totalHealing;
  }

  get doubleCastRate(): number {
    return (
      this.casts.filter((v) => v.isDoubleCast && v.reason !== DeathStrikeReason.GoodHealing)
        .length / this.casts.length
    );
  }

  get problems(): DeathStrikeProblem[] {
    return this.casts
      .filter((cast) => cast.reason === DeathStrikeReason.Other)
      .map((cast) => {
        const data = castProblem(cast, this.rp);

        return {
          data,
          range: {
            start: cast.cast.timestamp,
            end: cast.cast.timestamp + FOLLOWUP_WINDOW,
          },
          context: 3000,
          severity: data.followupDamageTaken
            ? (data.followupDamageTaken ?? 0) + (data.followupAbsorbedDamage ?? 0)
            : (data.hitPoints / 100) * ((data.maxRunicPower - data.runicPower) / 10),
        };
      });
  }

  private recordHeal(event: HealEvent) {
    this.lastKnownMaxHp = event.maxHitPoints ?? this.lastKnownMaxHp;
    this._totalHealing += event.amount + (event.absorbed ?? 0);
  }

  private get remainingBloodShield(): number {
    return this.bloodShieldQueue.reduce((total, entry) => total + entry.absorbRemaining, 0);
  }

  private recordAbsorbGen(event: CastEvent, cast: CastReason) {
    const buffEvent = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(
      event,
      DEATH_STRIKE_ABSORB_GEN,
    );
    const absorbGenerated = Math.max(buffEvent?.absorb ?? 0 - this.remainingBloodShield, 0);

    if (absorbGenerated > 0) {
      this.bloodShieldQueue.push({
        cast,
        absorbGenerated,
        absorbRemaining: absorbGenerated,
      });
    }
  }

  private onCast(event: CastEvent) {
    const healEvent = GetRelatedEvent<HealEvent>(event, DEATH_STRIKE_HEAL);
    const previousTimestamp = this.casts.at(-1)?.cast.timestamp;
    const isDoubleCast =
      previousTimestamp !== undefined && event.timestamp - previousTimestamp < DOUBLE_DS_WINDOW_MS;

    let cast: CastReason | undefined = undefined;
    if (healEvent) {
      // good healing means at least 40% hp. totally made up
      const healingPct = healEvent.amount / healEvent.maxHitPoints;
      const initialHpPct = (healEvent.hitPoints - healEvent.amount) / healEvent.maxHitPoints;

      if (initialHpPct <= LOW_HP_THRESHOLD) {
        cast = {
          reason: DeathStrikeReason.LowHealth,
          cast: event,
          isDoubleCast,
        };
      } else if (healingPct >= GOOD_HIT_THRESHOLD) {
        cast = {
          reason: DeathStrikeReason.GoodHealing,
          cast: event,
          isDoubleCast,
        };
      } else if ((this.rp.getResource(event)?.amount ?? 0) >= DUMP_RP_THRESHOLD) {
        cast = {
          reason: DeathStrikeReason.DumpRP,
          cast: event,
          isDoubleCast,
        };
      } else {
        // blood shield is handled via references + mutability. yay
        cast = {
          reason: DeathStrikeReason.Other,
          cast: event,
          isDoubleCast,
        };
      }
    } else {
      // other for this. don't understand it
      cast = {
        reason: DeathStrikeReason.Other,
        cast: event,
        isDoubleCast,
      };
    }

    this.casts.push(cast);
    this.recordAbsorbGen(event, cast);
  }

  private getShieldQueueEntries(amount: number): WithAmount<BSQueueEntry>[] {
    const result = [];
    let remainingAmount = amount;
    while (remainingAmount > 0 && this.bloodShieldQueue.length > 0) {
      const entry = this.bloodShieldQueue.shift();
      if (!entry) {
        break;
      }

      const amount = Math.min(entry.absorbRemaining, remainingAmount);
      remainingAmount -= amount;
      result.push({
        ...entry,
        amount,
      });

      if (amount < entry.absorbRemaining) {
        // return to the front of the queue if we're only partially consuming.
        // less efficient but easier to reason about
        entry.absorbRemaining -= amount;
        this.bloodShieldQueue.unshift(entry);
      }
    }

    if (remainingAmount > 0) {
      console.error('inconsistent state in blood shield tracking', this.bloodShieldQueue, amount);
    }

    return result;
  }

  private recordAbsorb(event: AbsorbedEvent) {
    const damageEvent = GetRelatedEvent<DamageEvent>(event, BLOOD_SHIELD_ABSORBED_HIT);
    if (!damageEvent) {
      console.warn('found blood shield absorb with no damage taken event', event);
      return;
    }

    const targetEntries = this.getShieldQueueEntries(event.amount);
    if (targetEntries.length === 0) {
      console.warn('found blood shield absorb with an empty queue', event);
      return;
    }

    const maxHp = damageEvent.maxHitPoints ?? this.lastKnownMaxHp;
    this.lastKnownMaxHp = maxHp;

    if (!maxHp) {
      return; // haven't seen any hits yet. can't be that important, right?
    }

    const targetAbsorbAmount = maxHp * BLOOD_SHIELD_THRESHOLD;
    const actualHitSize =
      damageEvent.amount + (damageEvent.absorbed ?? 0) + (damageEvent.overkill ?? 0);
    if (actualHitSize >= targetAbsorbAmount) {
      // these hits count for blood shield generation. modify their cast reasons if they're worse.
      for (const entry of targetEntries) {
        if (entry.cast.reason < DeathStrikeReason.BloodShield) {
          entry.cast.reason = DeathStrikeReason.BloodShield;
        }
      }
    }
  }

  private recordDamageTaken(event: DamageEvent) {
    const lastCast = this.casts.at(-1);

    if (!lastCast || event.timestamp - lastCast.cast.timestamp > FOLLOWUP_WINDOW) {
      return;
    }

    // for this we actually explicitly *don't include* absorbs in the overall damage because it makes the charts look jank and this is only for sorting
    lastCast.followupDamageTaken =
      (lastCast.followupDamageTaken ?? 0) + event.amount + (event.overkill ?? 0);
    lastCast.followupAbsorbedDamage =
      (lastCast.followupAbsorbedDamage ?? 0) + (event.absorbed ?? 0);
    lastCast.hasFollowupMelee = lastCast.hasFollowupMelee || isMeleeAttack(event);
  }

  /**
   * do a final pass to turn any death strike casts that occurred while not actively tanking into "Dump RP" casts.
   *
   * the rule is, if you didn't take any relevant damage (at least 50% of HP) or melees in the `FOLLOWUP_WINDOW` after the cast, you're not actively tanking.
   */
  private finalizeCastReasons() {
    for (const cast of this.casts) {
      if (cast.reason === DeathStrikeReason.Other && !cast.hasFollowupMelee) {
        const healEvent = GetRelatedEvent<HealEvent>(cast.cast, DEATH_STRIKE_HEAL);
        const maxHp = healEvent?.maxHitPoints ?? 0;

        if (cast.followupDamageTaken ?? 0 <= maxHp / 2) {
          cast.reason = DeathStrikeReason.DumpRP;
        }
      }
    }
  }
}

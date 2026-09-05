import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  Ability,
  AbsorbedEvent,
  CastEvent,
  DamageEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';

import SpellManaCost from './SpellManaCost';
import HealingValue, { effectiveHealing } from 'parser/shared/modules/HealingValue';
import DamageValue, { effectiveDamage } from 'parser/shared/modules/DamageValue';
import StateHistory from 'parser/core/StateHistory';

export interface TrackedAbility {
  ability: Ability | null;
  casts: number;
  manaUsed: number;
  damageHits: number;
  damageVal: DamageValue;
  damageCriticalHits: number;
  damageCriticalVal: DamageValue;
  healingHits: number;
  healingVal: HealingValue;
  healingCriticalHits: number;
  healingCriticalVal: HealingValue;
}

interface TotalPoint {
  timestamp: number;
  total: number;
}

class AbilityTracker extends Analyzer {
  static dependencies = {
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
  };
  protected spellManaCost!: SpellManaCost;

  abilities = new Map<number, TrackedAbility>();

  protected totalDamagePoints: TotalPoint[] = [];
  protected totalHealingPoints: TotalPoint[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    const cast = this.getAbility(spellId, event.ability);
    cast.casts = cast.casts + 1;
    if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.MANA.id] !== undefined) {
      cast.manaUsed = cast.manaUsed + event.resourceCost[RESOURCE_TYPES.MANA.id];
    }
  }

  getAbility(spellId: number, abilityInfo: Ability | null = null) {
    let ability = this.abilities.get(spellId);
    if (ability === undefined) {
      ability = {
        ability: abilityInfo,
        casts: 0,
        manaUsed: 0,
        damageHits: 0,
        damageVal: DamageValue.empty(),
        damageCriticalHits: 0,
        damageCriticalVal: DamageValue.empty(),
        healingHits: 0,
        healingVal: HealingValue.empty(),
        healingCriticalHits: 0,
        healingCriticalVal: HealingValue.empty(),
      };
      this.abilities.set(spellId, ability);
    }
    if (!ability.ability && abilityInfo) {
      ability.ability = abilityInfo;
    }
    return ability;
  }

  /** Convenience method for getting number of times an ability hit (damage or healing) */
  getAbilityHits(spellId: number, abilityInfo: Ability | null = null) {
    const ability = this.getAbility(spellId, abilityInfo);
    return ability.damageHits + ability.healingHits;
  }

  /** Convenience method for getting the amount of effective damage an ability did */
  getAbilityDamage(spellId: number, abilityInfo: Ability | null = null) {
    return this.getAbility(spellId, abilityInfo).damageVal.effective;
  }

  /** Convenience method for getting an abilities damage per cast */
  getAbilityDamagePerCast(spellId: number, abilityInfo: Ability | null = null) {
    const ability = this.getAbility(spellId, abilityInfo);
    return ability.damageVal.effective / ability.casts || 0;
  }

  /** Convenience method for getting the amount of effective healing an ability did */
  getAbilityHealing(spellId: number, abilityInfo: Ability | null = null) {
    return this.getAbility(spellId, abilityInfo).healingVal.effective;
  }

  /** Convenience method for getting an abilities damage per cast */
  getAbilityHealingPerCast(spellId: number, abilityInfo: Ability | null = null) {
    const ability = this.getAbility(spellId, abilityInfo);
    return ability.healingVal.effective / ability.casts || 0;
  }

  protected addTotal(points: TotalPoint[], timestamp: number, amount: number) {
    const current = points.at(-1);
    if (current && current.timestamp === timestamp) {
      current.total += amount;
    } else {
      points.push({ timestamp, total: (current?.total ?? 0) + amount });
    }
  }

  private getTotalInRange(points: TotalPoint[], startTime: number, endTime: number) {
    const history = new StateHistory(points);

    const before = history.getBefore(startTime, true);
    const after = history.getBefore(endTime);

    return (after?.total ?? 0) - (before?.total ?? 0);
  }

  getTotalDamageInRange(startTime: number, endTime: number) {
    return this.getTotalInRange(this.totalDamagePoints, startTime, endTime);
  }

  getTotalHealingInRange(startTime: number, endTime: number) {
    return this.getTotalInRange(this.totalHealingPoints, startTime, endTime);
  }
}

// FIXME: this class structure is not good
class HealingTracker extends AbilityTracker {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER_PET), this.onHeal);
  }

  onHeal(event: HealEvent | AbsorbedEvent) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.healingHits = cast.healingHits + 1;
    cast.healingVal = cast.healingVal.addEvent(event);
    if (event.type === EventType.Heal && event.hitType === HIT_TYPES.CRIT) {
      cast.healingCriticalHits += 1;
      cast.healingCriticalVal = cast.healingCriticalVal.addEvent(event);
    }

    this.addTotal(this.totalHealingPoints, event.timestamp, effectiveHealing(event));
  }
}

class DamageTracker extends HealingTracker {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return; // don't track friendly-fire (Stagger, SLT)
    }
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.damageHits = cast.damageHits + 1;
    cast.damageVal = cast.damageVal.addEvent(event);
    if (event.hitType === HIT_TYPES.CRIT) {
      cast.damageCriticalHits += 1;
      cast.damageCriticalVal = cast.damageCriticalVal.addEvent(event);
    }

    this.addTotal(this.totalDamagePoints, event.timestamp, effectiveDamage(event));
  }
}

export default DamageTracker;

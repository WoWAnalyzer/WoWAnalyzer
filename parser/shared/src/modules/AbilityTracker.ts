import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { Ability, AbsorbedEvent, CastEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';

import SpellManaCost from './SpellManaCost';

export interface TrackedAbility {
  ability: Ability | null;
  casts: number;
  manaUsed: number;
  damageHits: number;
  damageEffective: number;
  damageAbsorbed: number;
  damageCriticalHits: number;
  damageCriticalEffective: number;
  damageCriticalAbsorbed: number;
  healingHits: number;
  healingEffective: number;
  healingAbsorbed: number;
  healingOverheal: number;
  healingCriticalHits: number;
  healingCriticalEffective: number;
  healingCriticalAbsorbed: number;
  healingCriticalOverheal: number;
}

class AbilityTracker extends Analyzer {
  static dependencies = {
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
  };
  protected spellManaCost!: SpellManaCost;

  abilities = new Map<number, TrackedAbility>();

  constructor(options: Options){
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
        damageEffective: 0,
        damageAbsorbed: 0,
        damageCriticalHits: 0,
        damageCriticalEffective: 0,
        damageCriticalAbsorbed: 0,
        healingHits: 0,
        healingEffective: 0,
        healingAbsorbed: 0,
        healingOverheal: 0,
        healingCriticalHits: 0,
        healingCriticalEffective: 0,
        healingCriticalAbsorbed: 0,
        healingCriticalOverheal: 0
      };
      this.abilities.set(spellId, ability);
    }
    if (!ability.ability && abilityInfo) {
      ability.ability = abilityInfo;
    }
    return ability;
  }
}

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
    // TODO: Use HealingValue class
    cast.healingEffective = cast.healingEffective + (event.amount || 0);
    if (event.type === EventType.Heal) {
      cast.healingAbsorbed = cast.healingAbsorbed + (event.absorbed || 0);
      cast.healingOverheal = cast.healingOverheal + (event.overheal || 0);
      if (event.hitType === HIT_TYPES.CRIT) {
        cast.healingCriticalHits = cast.healingCriticalHits + 1;
        cast.healingCriticalEffective = cast.healingCriticalEffective + (event.amount || 0);
        cast.healingCriticalAbsorbed = cast.healingCriticalAbsorbed + (event.absorbed || 0);
        cast.healingCriticalOverheal = cast.healingCriticalOverheal + (event.overheal || 0);
      }
    }
  }
}

class DamageTracker extends HealingTracker {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.damageHits = cast.damageHits + 1;
    // TODO: Use DamageValue class
    cast.damageEffective = cast.damageEffective + (event.amount || 0);
    cast.damageAbsorbed = cast.damageAbsorbed + (event.absorbed || 0); // Not sure

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.damageCriticalHits = cast.damageCriticalHits + 1;
      cast.damageCriticalEffective = cast.damageCriticalEffective + (event.amount || 0);
      cast.damageCriticalAbsorbed = cast.damageCriticalAbsorbed + (event.absorbed || 0); // Not sure
    }
  }
}

export default DamageTracker;

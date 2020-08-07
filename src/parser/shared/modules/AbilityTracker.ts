import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import { Ability, AbsorbedEvent, CastEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellManaCost from './SpellManaCost';

interface TrackedAbility {
  ability: Ability | null;
  casts?: number;
  manaUsed?: number;
  damageHits?: number;
  damageEffective?: number;
  damageAbsorbed?: number;
  damageCriticalHits?: number;
  damageCriticalEffective?: number;
  damageCriticalAbsorbed?: number;
  healingHits?: number;
  healingEffective?: number;
  healingAbsorbed?: number;
  healingOverheal?: number;
  healingCriticalHits?: number;
  healingCriticalEffective?: number;
  healingCriticalAbsorbed?: number;
  healingCriticalOverheal?: number;
}

class AbilityTracker extends Analyzer {
  static dependencies = {
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
  };

  abilities: { [spellId: number]: TrackedAbility } = {};

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;

    const cast = this.getAbility(spellId, event.ability);
    cast.casts = (cast.casts || 0) + 1;
    if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.MANA.id] !== undefined) {
      cast.manaUsed = (cast.manaUsed || 0) + event.resourceCost[RESOURCE_TYPES.MANA.id];
    }
  }

  getAbility(spellId: number, abilityInfo: Ability | null = null) {
    let ability = this.abilities[spellId];
    if (!ability) {
      ability = {
        ability: abilityInfo,
      };
      this.abilities[spellId] = ability;
    }
    if (!ability.ability && abilityInfo) {
      ability.ability = abilityInfo;
    }
    return ability;
  }
}
class HealingTracker extends AbilityTracker {
  on_byPlayer_heal(event: HealEvent | AbsorbedEvent) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.healingHits = (cast.healingHits || 0) + 1;
    // TODO: Use HealingValue class
    cast.healingEffective = (cast.healingEffective || 0) + (event.amount || 0);
    if (event.type === EventType.Heal) {
      cast.healingAbsorbed = (cast.healingAbsorbed || 0) + (event.absorbed || 0);
      cast.healingOverheal = (cast.healingOverheal || 0) + (event.overheal || 0);
      if (event.hitType === HIT_TYPES.CRIT) {
        cast.healingCriticalHits = (cast.healingCriticalHits || 0) + 1;
        cast.healingCriticalEffective = (cast.healingCriticalEffective || 0) + (event.amount || 0);
        cast.healingCriticalAbsorbed = (cast.healingCriticalAbsorbed || 0) + (event.absorbed || 0);
        cast.healingCriticalOverheal = (cast.healingCriticalOverheal || 0) + (event.overheal || 0);
      }
    }
  }

  on_byPlayer_absorbed(event: AbsorbedEvent) {
    this.on_byPlayer_heal(event);
  }

  on_byPlayerPet_heal(event: HealEvent) {
    this.on_byPlayer_heal(event);
  }

  on_byPlayerPet_absorbed(event: AbsorbedEvent) {
    this.on_byPlayer_heal(event);
  }
}
class DamageTracker extends HealingTracker {
  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.damageHits = (cast.damageHits || 0) + 1;
    // TODO: Use DamageValue class
    cast.damageEffective = (cast.damageEffective || 0) + (event.amount || 0);
    cast.damageAbsorbed = (cast.damageAbsorbed || 0) + (event.absorbed || 0); // Not sure

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.damageCriticalHits = (cast.damageCriticalHits || 0) + 1;
      cast.damageCriticalEffective = (cast.damageCriticalEffective || 0) + (event.amount || 0);
      cast.damageCriticalAbsorbed = (cast.damageCriticalAbsorbed || 0) + (event.absorbed || 0); // Not sure
    }
  }
}

export default DamageTracker;

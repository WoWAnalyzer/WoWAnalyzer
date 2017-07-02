import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import RESOURCE_TYPES from 'Parser/Core/RESOURCE_TYPES';

class AbilityTracker extends Module {
  abilities = {};

  priority = 10;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // Manipulate the event to include mana information so that we don't have to copy paste this anywhere we want to know mana. This can't be done through static functions as some mana costs require state (through class properties) to work properly. E.g. Penance triggers up to 4 cast events but only the first costs mana.
    event.manaCost = this.getManaCost(event);
    event.rawManaCost = this.getRawManaCost(event);
    event.hasInnervate = this.owner.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp);
    event.hasSymbolOfHope = this.owner.selectedCombatant.hasBuff(SPELLS.SYMBOL_OF_HOPE_TALENT.id, event.timestamp);

    const cast = this.getAbility(spellId, event.ability);
    cast.casts = (cast.casts || 0) + 1;
    if (event.manaCost) {
      cast.manaUsed = (cast.manaUsed || 0) + event.manaCost;
    }
  }

  getAbility(spellId, abilityInfo = null) {
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

  getHardcodedManaCost(event) {
    const spellId = event.ability.guid;
    const spell = SPELLS[spellId];
    return spell && spell.manaCost ? spell.manaCost : null;
  }
  getRawManaCost(event) {
    const hardcodedCost = this.getHardcodedManaCost(event);
    const actualCost = event.classResources ? event.classResources.reduce((cost, resource) => {
      if (resource.type !== RESOURCE_TYPES.MANA) {
        return cost;
      }
      return cost + (resource.cost || 0);
    }, 0) : 0;

    if (hardcodedCost !== null && actualCost && hardcodedCost !== actualCost) {
      console.error(event.ability.name, event.ability.guid, 'The hardcoded cost', hardcodedCost, 'did not match the actual cost', actualCost);
    }
    return hardcodedCost !== null ? hardcodedCost : actualCost;
  }
  getManaCost(event) {
    return this.getRawManaCost(event);
  }
}
class HealingTracker extends AbilityTracker {
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.healingHits = (cast.healingHits || 0) + 1;
    cast.healingEffective = (cast.healingEffective || 0) + (event.amount || 0);
    cast.healingAbsorbed = (cast.healingAbsorbed || 0) + (event.absorbed || 0);
    cast.healingOverheal = (cast.healingOverheal || 0) + (event.overheal || 0);

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.healingCriticalHits = (cast.healingCriticalHits || 0) + 1;
      cast.healingCriticalEffective = (cast.healingCriticalEffective || 0) + (event.amount || 0);
      cast.healingCriticalAbsorbed = (cast.healingCriticalAbsorbed || 0) + (event.absorbed || 0);
      cast.healingCriticalOverheal = (cast.healingCriticalOverheal || 0) + (event.overheal || 0);
    }
  }
  on_byPlayer_absorbed(event) {
    this.on_byPlayer_heal(event);
  }
}
class DamageTracker extends HealingTracker {
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.damangeHits = (cast.damangeHits || 0) + 1;
    cast.damangeEffective = (cast.damangeEffective || 0) + (event.amount || 0);
    cast.damangeAbsorbed = (cast.damangeAbsorbed || 0) + (event.absorbed || 0); // Not sure

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.damangeCriticalHits = (cast.damangeCriticalHits || 0) + 1;
      cast.damangeCriticalEffective = (cast.damangeCriticalEffective || 0) + (event.amount || 0);
      cast.damangeCriticalAbsorbed = (cast.damangeCriticalAbsorbed || 0) + (event.absorbed || 0); // Not sure
    }
  }
}

export default DamageTracker;

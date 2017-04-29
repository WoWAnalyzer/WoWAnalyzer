import Module from 'Main/Parser/Module';
import { HIT_TYPES } from 'Main/Parser/Constants';

class AbilityTracker extends Module {
  abilities = {};

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);
    cast.casts = (cast.casts || 0) + 1;
  }

  getAbility(spellId, abilityInfo = null) {
    let ability = this.abilities[spellId];
    if (!ability) {
      ability = {
        ability: abilityInfo,
      };
      this.abilities[spellId] = ability;
    }
    return ability;
  }
}
class HealingTracker extends AbilityTracker {
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    cast.healingHits = (cast.healingHits || 0) + 1;
    cast.healingEffective = (cast.healingEffective || 0) + (cast.amount || 0);
    cast.healingAbsorbed = (cast.healingAbsorbed || 0) + (cast.absorbed || 0);
    cast.healingOverheal = (cast.healingOverheal || 0) + (cast.overheal || 0);

    const isCrit = event.hitType === HIT_TYPES.CRIT;
    if (isCrit) {
      cast.critHits = (cast.critHits || 0) + 1;
      cast.critEffective = (cast.critEffective || 0) + (cast.amount || 0);
      cast.critAbsorbed = (cast.critAbsorbed || 0) + (cast.absorbed || 0);
      cast.critOverheal = (cast.critOverheal || 0) + (cast.overheal || 0);
    }
  }
}
class DamageTracker extends HealingTracker {
  // TODO: Implement
}

export default DamageTracker;

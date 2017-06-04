// import SPELLS from 'common/SPELLS';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class ElementalAbilityTracker extends AbilityTracker {
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }
    // const spellId = event.ability.guid;
    // const cast = this.getAbility(spellId, event.ability);
    // cast
    // TODO: add debuff/buff infos
  }
}

export default ElementalAbilityTracker;

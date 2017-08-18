import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class LightOfDawn extends Module {
  _lightOfDawnHealIndex = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this._lightOfDawnHealIndex = 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    event.lightOfDawnHealIndex = this._lightOfDawnHealIndex;
    this._lightOfDawnHealIndex += 1;
  }
}

export default LightOfDawn;

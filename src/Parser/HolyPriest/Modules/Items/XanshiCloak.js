import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';


class XanshiCloak extends Module {
  _xanshiActive = false;
  healing = 0;
  overhealing = 0;
  absorbed = 0;
  manaSaved = 0;
  casts = [];

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBack(ITEMS.XANSHI_CLOAK.id);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.XANSHI_CLOAK_BUFF.id) {
      return;
    }

    this._xanshiActive = false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.XANSHI_CLOAK_BUFF.id) {
      return;
    }

    this._xanshiActive = true;
  }

  on_byPlayer_heal(event) {
    if (!this._xanshiActive) { return; }

    this.healing += event.amount || 0;
    this.overhealing += event.overheal || 0;
    this.absorbed += event.absorbed || 0;
  }

  on_byPlayer_cast(event) {
    if (!this._xanshiActive) { return; }

    this.manaSaved += event.rawManaCost || 0;
    this.casts.push(event.ability.guid);
  }
}

export default XanshiCloak;

import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class PrayerOfMending extends Module {
  _firstPoMCast = null;
  removed = 0;
  heals = 0;
  healing = 0;
  prePoM = false;

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_BUFF.id) {
      return;
    }
    this.removed += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      return;
    }
    if (!this._firstPoMCast) {
      this.prePoM = true;
    }
    this.heals += 1;
    this.healing += event.amount || 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRAYER_OF_MENDING_CAST.id) {
      return;
    }
    if (!event) {
      this._firstPoMCast = event;
    }
  }

}

export default PrayerOfMending;

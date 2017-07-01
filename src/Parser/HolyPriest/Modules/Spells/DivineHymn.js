import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class DivineHymn extends Module {
  healing = 0;
  ticks = 0;
  overhealing = 0;
  absorbed = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIVINE_HYMN_HEAL.id) {
      return;
    }
    this.healing += event.amount || 0;
    this.overhealing += event.overheal || 0;
    this.absorbed += event.absorbed || 0;
    if (event.sourceID == event.targetID) {
      this.ticks += 1;
    }
  }

}

export default DivineHymn;

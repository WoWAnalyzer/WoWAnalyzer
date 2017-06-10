import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = false;

class ArchiveOfFaith extends Module {
  archiveOfFaithCast = 0;
  healing = 0;
  healingHOT = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CLEANSING_MATRIX.id) {
      this.archiveOfFaithCast++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CLEANSING_MATRIX.id) {
      this.healing += event.amount || 0;
      this.healing += event.absorbed || 0;
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.AOF_INFUSION_OF_LIGHT.id) {
      debug && console.log('HOT Casted: ' + event.amount);
      this.healingHOT += event.amount || 0;
      this.healingHOT += event.absorbed || 0;
    }
  }


  on_finished() {
    if(debug) {
      console.log('Healing: ' + this.healing);
      console.log('Casts ' + this.archiveOfFaithCast);
      console.log('HOT: ' + this.healingHOT);
    }
  }

}

export default ArchiveOfFaith;

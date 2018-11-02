import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';

// const MISTWEAVER_CHANNELED_SPELL_IDS = [SPELLS.ESSENCE_FONT.id, SPELLS.SOOTHING_MIST.id];

class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if ((event.ability.guid === SPELLS.ESSENCE_FONT.id) || (event.ability.guid === SPELLS.SOOTHING_MIST.id)) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(ability.guid)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;

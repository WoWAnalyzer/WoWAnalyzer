import SPELLS from 'common/SPELLS/index';
import CoreChanneling from 'parser/shared/modules/Channeling';

/**
 * Fabricates the required events to show the channeling of Potion of Replenishment.
 */
class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.POTION_OF_REPLENISHMENT.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.POTION_OF_REPLENISHMENT.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      this.log('Marking', this._currentChannel.ability.name, 'as ended since we started casting something else:', event.ability.name);
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;
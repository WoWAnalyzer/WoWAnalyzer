import SPELLS from 'common/SPELLS';
import { formatMilliseconds } from 'common/format';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Mind Flay and Void Torrent don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 */
class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
    combatants: Combatants,
  };

  _hasCastigation = null;
  on_initialized() {
    super.on_initialized();
    this._hasCastigation = this.combatants.selected.hasTalent(SPELLS.CASTIGATION_TALENT.id);
  }

  _bolt = 0;
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.PENANCE.id) {
      // Ignore this as a trigger for the channel since we use `applybuff` to track channel start, and this cast-event will only trigger for bolts other than the first.

      // Penance can be cast while moving so there should only be 2 possible reasons for ending the channel: fired all bolts and casting something else.
      const maxBolts = this._hasCastigation ? 4 : 3;
      this._bolt += 1;
      // Bolt is 0 indexed, so we've fired all bolts when _bolt equals maxBolts - 1
      if (this._bolt === (maxBolts - 1)) {
        console.log('Ending Penance channel due to last bolt being fired');
        this.endChannel(event);
      }
      return;
    }
    super.on_byPlayer_cast(event);
  }

  // Penance has not a single cast event for when channeling starts, but we're very lucky that there's an artifact trait that gives the player a buff called Speed of the Pious whenever he starts channeling Penance. Only from the second bolt and onwards do we get cast events.
  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.SPEED_OF_THE_PIOUS.id) {
      this._bolt = 0;
      this.beginChannel(event, {
        guid: SPELLS.PENANCE.id,
        name: SPELLS.PENANCE.name,
        type: 2,
        abilityIcon: SPELLS.PENANCE.icon,
      });
    }
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.PENANCE.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else:', event.ability.name);
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;

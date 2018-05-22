import SPELLS from 'common/SPELLS';
import { formatMilliseconds } from 'common/format';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import Combatants from 'Parser/Core/Modules/Combatants';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
    combatants: Combatants,
  };

  _previousPenanceTimestamp = 0;
  _hasCastigation = null;
  _bolt = 0;

  on_initialized() {
    super.on_initialized();
    this._hasCastigation = this.combatants.selected.hasTalent(
      SPELLS.CASTIGATION_TALENT.id
    );
  }

  isNewPenanceCast(timestamp) {
    return (
      !this._previousPenanceTimestamp ||
      timestamp - this._previousPenanceTimestamp > PENANCE_MINIMUM_RECAST_TIME
    );
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PENANCE.id && spellId !== SPELLS.PENANCE_HEAL.id) {
      super.on_byPlayer_cast(event);
      return;
    }

    // Handle the first bolt of each cast
    if (this.isNewPenanceCast(event.timestamp)) {
      this._bolt = 0;
      this.beginChannel(event, {
        guid: SPELLS.PENANCE.id,
        name: SPELLS.PENANCE.name,
        type: 2,
        abilityIcon: SPELLS.PENANCE.icon,
      });

      return;
    }

    // Handle following bolts
    const maxBolts = this._hasCastigation ? 4 : 3;
    this._bolt += 1;

    // Bolt is 0 indexed, so we've fired all bolts when _bolt equals maxBolts - 1
    if (this._bolt === maxBolts - 1) {
      console.log('Ending Penance channel due to last bolt being fired');
      this.endChannel(event);
    }
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.PENANCE.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      console.log(
        formatMilliseconds(event.timestamp - this.owner.fight.start_time),
        'Channeling',
        'Marking',
        this._currentChannel.ability.name,
        'as ended since we started casting something else:',
        event.ability.name
      );
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;

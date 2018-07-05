import SPELLS from 'common/SPELLS';
import { formatMilliseconds } from 'common/format';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import Penance from '../Spells/Penance';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
  };

  _previousPenanceTimestamp = this.owner.fight.start_time - PENANCE_MINIMUM_RECAST_TIME;
  _hasCastigation = null;
  _bolt = 0;

  constructor(...args) {
    super(...args);
    this._hasCastigation = this.selectedCombatant.hasTalent(
      SPELLS.CASTIGATION_TALENT.id
    );
  }

  isNewPenanceCast(timestamp) {
    return timestamp - this._previousPenanceTimestamp > PENANCE_MINIMUM_RECAST_TIME;
  }

  on_byPlayer_cast(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      super.on_byPlayer_cast(event);
      return;
    }

    // Handle the first bolt of each cast
    if (this.isNewPenanceCast(event.timestamp)) {
      this._bolt = 0;
      this._previousPenanceTimestamp = event.timestamp;
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
    console.log(this._bolt);
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

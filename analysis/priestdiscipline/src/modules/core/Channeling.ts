import SPELLS from 'common/SPELLS';
import { AbilityEvent, Ability, CastEvent, EndChannelEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import CoreChanneling from 'parser/shared/modules/Channeling';

import Penance from '../spells/Penance';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

const debug = false;

class Channeling extends CoreChanneling {
  _previousPenanceTimestamp = this.owner.fight.start_time - PENANCE_MINIMUM_RECAST_TIME;
  _hasCastigation: boolean = false;
  _bolt: number = 0;

  constructor(options: Options) {
    super(options);
    this._hasCastigation = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id);
  }

  isNewPenanceCast(timestamp: number) {
    return timestamp - this._previousPenanceTimestamp > PENANCE_MINIMUM_RECAST_TIME;
  }

  onCast(event: CastEvent) {
    if (!Penance.isPenance(event.ability.guid)) {
      super.onCast(event);
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

    // Bolt is 0 indexed, so we've fired all bolts when _bolt equals maxBolts - 1
    if (this._bolt === maxBolts - 1) {
      console.log('Ending Penance channel due to last bolt being fired');
      this.endChannel(event);
    }
  }

  cancelChannel(event: EndChannelEvent, ability: Ability) {
    if (this.isChannelingSpell(SPELLS.PENANCE.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      debug &&
        this.debug(
          'Marking',
          ((this._currentChannel as unknown) as AbilityEvent<any> | null)?.ability.name,
          'as ended since we started casting something else:',
          event.ability.name,
        );
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;

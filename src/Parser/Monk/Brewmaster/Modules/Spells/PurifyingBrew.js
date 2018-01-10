import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SharedBrews from '../Core/SharedBrews';

class PurifyingBrew extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
  };

  on_byPlayer_cast(event) {
    if(event.ability.guid === SPELLS.PURIFYING_BREW.id) {
      this.brews.consumeCharge(event);
    }
  }
}

export default PurifyingBrew;

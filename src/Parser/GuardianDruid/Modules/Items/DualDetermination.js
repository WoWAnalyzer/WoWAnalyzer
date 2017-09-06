import ITEMS from 'common/ITEMS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

class DualDetermination extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  SURVIVAL_INSTINCT_STACKS = 2

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.DUAL_DETERMINATION.id);
    if(this.active) {
        debug && console.log('Has Dual Determination');
        this.SURVIVAL_INSTINCT_STACKS = 3;
    }
  }
}

export default DualDetermination;

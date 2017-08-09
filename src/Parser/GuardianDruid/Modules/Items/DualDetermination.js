import ITEMS from 'common/ITEMS';
import Module from 'Parser/Core/Module';

const debug = true;

class DualDetermination extends Module {
    SURVIVAL_INSTINCT_STACKS = 2

    on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.DUAL_DETERMINATION.id);
    }
    if(this.active) {
        debug && console.log('Has Dual Determination');
        this.SURVIVAL_INSTINCT_STACKS = 3;
    }
  }
}

export default DualDetermination;
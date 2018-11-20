import Analyzer from 'parser/core/Analyzer';

import DemoPets from './index';

const debug = false;

class PetDamageHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  on_byPlayerPet_damage(event) {
    const petInfo = this.demoPets._getPetInfo(event.sourceID);
    if (!petInfo) {
      debug && this.error(`Pet damage event with nonexistant pet id ${event.sourceID}`);
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    this.demoPets.damage.addDamage(petInfo, event.sourceInstance, damage);
  }

}

export default PetDamageHandler;

import Analyzer from 'parser/core/Analyzer';

import DemoPets from './index';

const debug = false;

class PetDamageHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  on_byPlayerPet_damage(event) {
    const petInfo = this._getPetInfo(event.sourceID);
    if (!petInfo) {
      debug && this.error(`Pet damage event with nonexistant pet id ${event.sourceID}`);
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    this.demoPets.damage.addDamage(petInfo, event.sourceInstance, damage);
  }

  _getPetInfo(id, isGuid = false) {
    let pet;
    if (isGuid) {
      pet = this.owner.playerPets.find(pet => pet.guid === id);
    }
    else {
      pet = this.owner.playerPets.find(pet => pet.id === id);
    }
    if (!pet) {
      debug && this.error(`NewPets._getPetInfo() called with nonexistant pet ${isGuid ? 'gu' : ''}id ${id}`);
      return null;
    }
    return pet;
  }
}

export default PetDamageHandler;

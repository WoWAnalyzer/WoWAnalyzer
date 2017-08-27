import Module from 'Parser/Core/Module';

class Pets extends Module {
  _pets = {}

  on_initialized() {
    this.active = true;
    this._pets = this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.player.id);
  }

  get fetchPets(){
    return this._pets;
  }

  fetchPet(pet){
    return this.fetchPets.find(_pet => _pet.guid === pet.id);
  }

}

export default Pets;
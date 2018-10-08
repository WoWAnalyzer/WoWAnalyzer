import Entities from './Entities';
import Pet from '../../core/Pet';

const debug = false;

class Pets extends Entities {
  pets = {};
  getEntities() {
    return this.pets;
  }
  getEntity(event) {
    if (!event.targetIsFriendly) {
      return null;
    }
    const sourceId = event.targetID;
    let pet = this.pets[sourceId];
    if (!pet) {
      const baseInfo = this.owner.playerPets.find(pet => pet.id === sourceId);
      if (!baseInfo) {
        debug && console.warn('Pet not noteworthy enough:', sourceId, event);
        return null;
      }
      pet = new Pet(this.owner, baseInfo);
      this.pets[sourceId] = pet;
    }
    return pet;
  }
  getSourceEntity(event) {
    if (!event.sourceIsFriendly) {
      return null;
    }
    const sourceId = event.sourceID;
    let pet = this.pets[sourceId];
    if (!pet) {
      const baseInfo = this.owner.playerPets.find(pet => pet.id === sourceId);
      if (!baseInfo) {
        debug && console.warn('Pet not noteworthy enough:', sourceId, event);
        return null;
      }
      pet = new Pet(this.owner, baseInfo);
      this.pets[sourceId] = pet;
    }
    return pet;
  }
}

export default Pets;

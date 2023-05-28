import Analyzer from 'parser/core/Analyzer';

import PetDamage from '../PetDamage';
import Timeline from '../Timeline';
import { TimelinePet } from '../TimelinePet';

const debug = false;

class DemoPets extends Analyzer {
  get currentPets() {
    return this._getPets();
  }

  get permanentPetDamage() {
    return this.damage.permanentPetDamage;
  }

  // API

  get petsBySummonAbility() {
    return this.timeline.groupPetsBySummonAbility();
  }

  damage = new PetDamage();
  timeline = new Timeline();

  getPetDamage(id: number, instance: number | null = null, isGuid = true) {
    // if instance = null, returns total damage from all instances, otherwise from a specific instance
    // isGuid = true, because it's more convenient to call this with getPetDamage(PETS.SOME_PET.guid)
    // because you know what you're looking for (pet IDs change, GUIDs don't)
    const guid = isGuid ? id : this._toGuid(id);
    if (!this.damage.hasEntry(guid, instance)) {
      debug &&
        this.error(`this.getPetDamage() called with nonexistant ${isGuid ? 'gu' : ''}id ${id}`);
      return 0;
    }
    return this.damage.getDamageForGuid(guid, instance);
  }

  getPetCount(timestamp = this.owner.currentTimestamp, petId: number | null = null) {
    return this.timeline
      .getPetsAtTimestamp(timestamp)
      .filter((pet) => (petId ? pet.id === petId : true)).length;
  }

  // HELPER METHODS

  _getPets(timestamp = this.owner.currentTimestamp) {
    return this.timeline.getPetsAtTimestamp(timestamp);
  }

  _getPetFromTimeline(id: number, instance: number) {
    return this.timeline.find((pet: TimelinePet) => pet.id === id && pet.instance === instance);
  }

  _getPetInfo(id: number, isGuid = false) {
    let pet;
    if (isGuid) {
      pet = this.owner.playerPets.find((pet) => pet.guid === id);
    } else {
      pet = this.owner.playerPets.find((pet) => pet.id === id);
    }
    if (!pet) {
      debug &&
        this.error(
          `NewPets._getPetInfo() called with nonexistant pet ${isGuid ? 'gu' : ''}id ${id}`,
        );
      return null;
    }
    return pet;
  }

  _toGuid(id: number) {
    return this._getPetInfo(id)!.guid;
  }
}

export default DemoPets;

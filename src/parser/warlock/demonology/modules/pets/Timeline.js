import SPELLS from 'common/SPELLS';

import TimelinePet from './TimelinePet';
import { isPermanentPet } from './helpers';

const debug = true;

class Timeline {
  timeline = [];

  addPet(pet) {
    this.timeline.push(pet);
  }

  pushPermanentPetToStart(petInfo, id, instance, timestamp) {
    const pet = new TimelinePet(petInfo, id, instance, timestamp, Infinity, null, null);
    this.timeline.unshift(pet);
  }

  find(filter) {
    // just a forward to the inner timeline
    return this.timeline.find(filter);
  }

  tryDespawnLastPermanentPet(timestamp) {
    const permanentPets = this.petTimeline.filter(pet => isPermanentPet(pet.guid));
    if (permanentPets.length > 0) {
      debug && console.log('Despawning last permanent pet');
      permanentPets[permanentPets.length - 1].despawn(timestamp); // not entirely accurate, pet could've died earlier, but there's probably no way of detecting it
    }
  }

  getPetsAtTimestamp(timestamp) {
    return this.timeline.filter(pet => pet.spawn <= timestamp && timestamp <= (pet.realDespawn || pet.expectedDespawn));
  }

  groupPetsBySummonAbility() {
    return this.timeline.reduce((obj, pet) => {
      const key = pet.summonedBy || 'unknown';
      const spellName = pet.summonedBy ? SPELLS[pet.summonedBy].name : 'unknown';
      obj[key] = obj[key] || { spellName, pets: [] };
      obj[key].pets.push(pet);
      return obj;
    }, {});
  }
}

export default Timeline;

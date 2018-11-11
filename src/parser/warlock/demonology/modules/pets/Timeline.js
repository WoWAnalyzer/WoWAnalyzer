import SPELLS from 'common/SPELLS';

import { DESPAWN_REASONS } from './TimelinePet';
import { isPermanentPet } from './helpers';

const debug = true;

class Timeline {
  timeline = [];

  addPet(pet) {
    this.timeline.push(pet);
  }

  find(filter) {
    // just a forward to the inner timeline
    return this.timeline.find(filter);
  }

  tryDespawnLastPermanentPet(timestamp) {
    const permanentPets = this.timeline.filter(pet => isPermanentPet(pet.guid));
    if (permanentPets.length > 0) {
      debug && console.log('Despawning last permanent pet');
      permanentPets[permanentPets.length - 1].despawn(timestamp, DESPAWN_REASONS.NEW_PERMANENT_PET); // not entirely accurate, pet could've died earlier, but there's probably no way of detecting it
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

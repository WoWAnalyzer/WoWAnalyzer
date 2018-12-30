import SPELLS from 'common/SPELLS';

import { DESPAWN_REASONS } from './TimelinePet';
import { isPermanentPet, isWarlockPet } from './helpers';

const debug = false;

class Timeline {
  timeline = [];

  addPet(pet) {
    this.timeline.push(pet);
  }

  find(filter) {
    // just a forward to the inner timeline
    return this.timeline.find(filter);
  }

  filter(predicate) {
    // forward
    return this.timeline.filter(predicate);
  }

  tryDespawnLastPermanentPet(timestamp) {
    const permanentPets = this.timeline.filter(pet => isPermanentPet(pet.guid));
    if (permanentPets.length > 0) {
      debug && console.log('Despawning last permanent pet');
      permanentPets[permanentPets.length - 1].despawn(timestamp, DESPAWN_REASONS.NEW_PERMANENT_PET); // not entirely accurate, pet could've died earlier, but there's probably no way of detecting it
    }
  }

  getPetsAtTimestamp(timestamp) {
    // Warlock pet check so this doesn't pick up things like Vanquished Tendrils of G'huun (trinket, spawns a pet that timeline picks up)
    return this.timeline.filter(pet => isWarlockPet(pet.guid) &&
      pet.spawn <= timestamp && timestamp <= (pet.realDespawn || pet.expectedDespawn));
  }

  groupPetsBySummonAbility() {
    return this.timeline.reduce((obj, pet) => {
      // if pet is summoned by unknown spell, it gets summonedBy = -1
      const key = pet.summonedBy !== -1 ? pet.summonedBy : 'unknown';
      const spellName = (SPELLS[pet.summonedBy] && SPELLS[pet.summonedBy].name) || 'unknown';
      obj[key] = obj[key] || { spellName, pets: [] };
      obj[key].pets.push(pet);
      return obj;
    }, {});
  }
}

export default Timeline;

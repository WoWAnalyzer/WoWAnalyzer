import Module from 'Parser/Core/Module';
import CorePets from 'Parser/Core/Modules/Pets';
import Combatants from 'Parser/Core/Modules/Combatants';

import PETS from 'common/PETS';
import SPELLS from 'common/SPELLS';

// tracks individual pet (as in pet type) damage, summed together across pet instances
// also tracks pet summons and despawns and provides getPets(timestamp)
class Pets extends Module {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };

  // Keys are ids in PETS.js
  petDamage = {};
  petsTimeline = [];

  _getCorrectDuration(pet) {
    if (!PETS[pet.guid]) {
      // pet that's not in PETS.js, which is most likely a permanent pet, set duration to 0, it doesn't mess up with the filtering
      return 0;
    }
    if (pet.guid !== PETS.WILDIMP_ON_DREADSTALKER.id && pet.guid !== PETS.DREADSTALKER.id) {
      return PETS[pet.guid].baseDuration;
    }
    return (this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T19_4P_BONUS.id)) ? 14.5 : 12; // T19 4pc extends duration of either one
  }

  on_byPlayer_summon(event) {
    const pet = this.pets.getEntity(event);
    pet.instance = event.targetInstance;
    pet.summonTimestamp = event.timestamp;
    pet.despawnTimestamp = event.timestamp + this._getCorrectDuration(pet) * 1000; // duration is in seconds
    this.petsTimeline.push(pet);
  }

  on_byPlayerPet_damage(event) {
    const pet = this.pets.getEntity(event);
    // should take care of all pets (even those permanent, they have unique guid for each player it seems)
    if (this.petDamage[pet.guid] === undefined) {
      this.petDamage[pet.guid] = 0;
    }
    this.petDamage[pet.guid] += event.amount + (event.absorbed || 0);
  }

  getPets(timestamp) {
    return this.petsTimeline.filter(pet => timestamp >= pet.summonTimestamp && timestamp <= pet.despawnTimestamp);
  }
}

export default Pets;

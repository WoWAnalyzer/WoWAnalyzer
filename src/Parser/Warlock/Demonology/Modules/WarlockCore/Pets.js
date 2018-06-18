import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import PETS from 'common/PETS';
import SPELLS from 'common/SPELLS';

// tracks individual pet (as in pet type) damage, summed together across pet instances
// also tracks pet summons and despawns and provides getPets(timestamp)
class Pets extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // Keys are ids in PETS.js
  petDamage = {
    [PETS.WILDIMP_ON_DREADSTALKER.id]: {},
    [PETS.WILDIMP.id]: {},
    [PETS.DREADSTALKER.id]: {},
    [PETS.GRIMOIRE_FELGUARD.id]: {},
    [PETS.DOOMGUARD.id]: {},
    [PETS.INFERNAL.id]: {},
    [PETS.DARKGLARE.id]: {},
    /*
      [permanent_pet_guid]: 0, !!!
      [pet_guid]: {
        [pet_instance]: 0,
        ...
      },
      ...
    */
  };
  petsTimeline = [];

  _getCorrectDuration(guid) {
    if (!PETS[guid]) {
      // pet that's not in PETS.js, which is most likely a permanent pet, return something neutral
      return 0;
    }
    if (guid !== PETS.WILDIMP_ON_DREADSTALKER.id && guid !== PETS.DREADSTALKER.id) {
      return PETS[guid].baseDuration;
    }
    return (this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T19_4P_BONUS.id)) ? 14.5 : 12; // T19 4pc extends duration of either one
  }

  _isPermanentPet(guid) {
    return Object.keys(PETS).map(key => PETS[key]).every(pet => pet.id !== guid);
  }

  on_byPlayer_summon(event) {
    const petInfo = this.owner.playerPets.find(pet => pet.id === event.targetID);
    // temporary workaround until revamp
    if (!petInfo) {
      return;
    }
    const pet = {
      guid: petInfo.guid,
      name: (PETS[petInfo.guid]) ? PETS[petInfo.guid].name : "Felguard",
      instance: event.targetInstance,
      summonTimestamp: event.timestamp,
      despawnTimestamp: event.timestamp + this._getCorrectDuration(petInfo.guid) * 1000, // duration is in seconds
    };
    this.petsTimeline.push(pet);
  }

  on_byPlayer_instakill(event) {
    // triggered by talent Implosion - draws all Wild Imps towards target and makes them explode, event contains targetID and targetInstance as for each individual pet destroyed
    const petInfo = this.owner.playerPets.find(pet => pet.id === event.targetID);
    const pet = this.petsTimeline.find(pet => pet.guid === petInfo.guid && pet.instance === event.targetInstance);
    pet.despawnTimestamp = event.timestamp;
  }

  on_byPlayerPet_damage(event) {
    const id = event.sourceID;
    const instance = event.sourceInstance;
    const petInfo = this.owner.playerPets.find(pet => pet.id === id);
    // temporary
    if (!petInfo) {
      return;
    }
    const permanentPetInTimeline = this.petsTimeline.find(pet => pet.guid === petInfo.guid);
    if (!permanentPetInTimeline) {
      // most likely will be only for the permanent pet, as the Felguard usually charges seconds after the fight starts which makes a damage event too
      // so it artificially pushes it at the beginning of the timeline, meaning it was there when the combat began
      const pet = {
        guid: petInfo.guid,
        name: (PETS[petInfo.guid]) ? PETS[petInfo.guid].name : "Felguard",
        instance: event.sourceInstance,
        summonTimestamp: this.owner.fight.start_time,
        despawnTimestamp: this.owner.fight.start_time + this._getCorrectDuration(petInfo.guid) * 1000,
      };
      this.petsTimeline.unshift(pet);
    }
    // permanent pets don't have instances
    if (this._isPermanentPet(petInfo.guid)) {
      if (this.petDamage[petInfo.guid] === undefined) {
        this.petDamage[petInfo.guid] = 0;
      }
      this.petDamage[petInfo.guid] += event.amount + (event.absorbed || 0);
    }
    else {
      if (!this.petDamage[petInfo.guid]) {
        this.petDamage[petInfo.guid] = {};
      }
      if (this.petDamage[petInfo.guid][instance] === undefined) {
        this.petDamage[petInfo.guid][instance] = 0;
      }
      this.petDamage[petInfo.guid][instance] += event.amount + (event.absorbed || 0);
    }
  }

  // we can't access (at least directly) the damage by our permanent pet, most likely Felguard, because its guid isn't in PETS
  getPermanentPetDamage() {
    const permanentPetGuid = Object.keys(this.petDamage).filter(guid => !PETS[guid]); // should only contain one? need to find if re-summoned main pets have the same guid or not
    return this.petDamage[permanentPetGuid];
  }

  getTotalPetDamage(guid) {
    if (this._isPermanentPet(guid)) {
      return this.petDamage[guid];
    }
    else {
      return Object.keys(this.petDamage[guid]).map(instance => this.petDamage[guid][instance]).reduce((s, v) => s + v, 0);
    }
  }

  getAveragePetDamage(guid) {
    if (this._isPermanentPet(guid)) {
      return this.petDamage[guid]; // permanent pet is only one, so average = total
    }
    let instances = Object.keys(this.petDamage[guid]).length;
    // if the pet haven't been summoned yet, totalDamage would come out as 0 as correct, but instances would be 0 too
    // in order to avoid division by zero errors, set denominator to 1 (still gives average = 0 for 0 totalDamage)
    instances = (instances > 0) ? instances : 1;
    const totalDamage = this.getTotalPetDamage(guid);
    return totalDamage / instances;
  }

  getPets(timestamp) {
    return this.petsTimeline.filter(pet => (timestamp >= pet.summonTimestamp && timestamp <= pet.despawnTimestamp) || this._isPermanentPet(pet.guid));
  }
}

export default Pets;

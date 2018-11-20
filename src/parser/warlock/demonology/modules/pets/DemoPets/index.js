import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

import Timeline from '../Timeline';
import PetDamage from '../PetDamage';
import PETS from '../PETS';

const debug = false;

class DemoPets extends Analyzer {
  damage = new PetDamage();
  timeline = new Timeline();

  wildImpIds = []; // important for different handling of duration, these IDs change from log to log

  constructor(...args) {
    super(...args);
    this.initializeWildImps();
  }

  // API

  get currentPets() {
    return this._getPets();
  }

  getPetDamage(id, instance = null, isGuid = true) {
    // if instance = null, returns total damage from all instances, otherwise from a specific instance
    // isGuid = true, because it's more convenient to call this with getPetDamage(PETS.SOME_PET.guid)
    // because you know what you're looking for (pet IDs change, GUIDs don't)
    const guid = isGuid ? id : this._toGuid(id);
    if (!this.damage.hasEntry(guid, instance)) {
      debug && this.error(`this.getPetDamage() called with nonexistant ${isGuid ? 'gu' : ''}id ${id}`);
      return 0;
    }
    return this.damage.getDamageForGuid(guid, instance);
  }

  get permanentPetDamage() {
    return this.damage.permanentPetDamage;
  }

  getPetCount(timestamp = this.owner.currentTimestamp, petId = null) {
    return this.timeline.getPetsAtTimestamp(timestamp).filter(pet => petId ? pet.id === petId : true).length;
  }

  get petsBySummonAbility() {
    return this.timeline.groupPetsBySummonAbility();
  }

  // HELPER METHODS

  _getPets(timestamp = this.owner.currentTimestamp) {
    return this.timeline.getPetsAtTimestamp(timestamp);
  }

  _getPetFromTimeline(id, instance) {
    return this.timeline.find(pet => pet.id === id && pet.instance === instance);
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

  initializeWildImps() {
    // there's very little possibility these statements wouldn't return an object, Hand of Guldan is a key part of rotation
    this.wildImpIds.push(this._toId(PETS.WILD_IMP_HOG.guid));
    if (this.selectedCombatant.hasTalent(SPELLS.INNER_DEMONS_TALENT.id)) {
      // and Inner Demons passively summons these Wild Imps
      this.wildImpIds.push(this._toId(PETS.WILD_IMP_INNER_DEMONS.guid));
    }
    // basically player would have to be dead from the beginning to end to not have these recorded
    // (and even then it's probably fine, because it takes the info from parser.playerPets, which is cross-fight)
  }

  _toId(guid) {
    return this._getPetInfo(guid, true).id;
  }

  _toGuid(id) {
    return this._getPetInfo(id).guid;
  }
}

export default DemoPets;

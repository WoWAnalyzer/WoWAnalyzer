import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

import Timeline from '../Timeline';
import PetDamage from '../PetDamage';
import PETS from '../PETS';

const debug = false;

  /*
    TEST LOG - http://localhost:3000/report/3WQ2BFC4AJPqDLra/13-LFR+Mythrax+-+Kill+(4:22)/260-Grogar

    BEFORE REFACTOR - data that should remain the same!
    ​	_hasDemonicConsumption: false
    ​	_implosionTargetsHit: [ "33.0" ]
    ​	_lastDemonicTyrantCast: 54135785
    ​	_lastIDtick: 54169689
    ​	_lastImplosionCast: 54151999
    ​	_lastPlayerPosition: { x: 24331, y: 23459 }
    ​	_lastSpendResource: 54168237
    ​	_petsAffectedByDemonicTyrant: [ 287, 264, 276, 285 ]
    ​	wildImpIds: [ 287, 264 ]
      timeline.length = 148
      // guid, name and total
      damage.pets = {
        55659 - Wild Imp, 199027
        98035 - Dreadstalker, 364343
        135002 - Demonic Tyrant, 114633
        135816 - Vilefiend, 187418
        136398 - Illidari Satyr, 4139
        136402 - Urzul, 19825
        136403 - Void Terror, 35451
        136404 - Bilescourge, 13010
        136406 - Shivarra, 9502
        136407 - Wrathguard, 20836
        136408 - Darkhound, 18047
        143622 - Wild Imp, 51730
        36961778 - Flaatom, 343638

      }
 */
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

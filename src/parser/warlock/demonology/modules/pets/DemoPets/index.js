import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';

import Timeline from '../Timeline';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';
import PetDamage from '../PetDamage';
import PETS from '../PETS';

const debug = false;
const test = false;

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
    ​	_wildImpIds: [ 287, 264 ]
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

  _lastImplosionCast = null;
  _implosionTargetsHit = [];
  _wildImpIds = []; // important for different handling of duration, these IDs change from log to log

  constructor(...args) {
    super(...args);
    this._initializeWildImps();
  }

  // Pet timeline

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.IMPLOSION_CAST.id) {
      this._handleImplosionCast(event);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.IMPLOSION_DAMAGE.id) {
      return;
    }
    if (!event.x || !event.y) {
      debug && this.error('Implosion damage event doesn\'t have a target position', event);
      return;
    }
    // Pairing damage events with Imploded Wild Imps
    // First target hit kills an imp and marks the target
    // Consequent target hits just mark the target (part of the same AOE explosion)
    // Next hit on already marked target means new imp explosion
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this._implosionTargetsHit.length === 0) {
      test && this.log(`First Implosion damage after cast on ${target}`);
    }
    else if (this._implosionTargetsHit.includes(target)) {
      test && this.log(`Implosion damage on ${target}, already marked => new imp exploded, reset array, marked`);
    }
    else if (this._implosionTargetsHit.length > 0 && !this._implosionTargetsHit.includes(target)) {
      this._implosionTargetsHit.push(target);
      test && this.log(`Implosion damage on ${target}, not hit yet, marked, skipped`);
      return;
    }
    this._implosionTargetsHit = [target];

    // handle Implosion
    // Implosion pulls all Wild Imps towards target, exploding them and dealing AoE damage
    // there's no connection of each damage event to individual Wild Imp, so take Imps that were present at the Implosion cast, order them by the distance from the target and kill them in this order (they should be travelling with the same speed)
    const imps = this._getPets(this._lastImplosionCast) // there's a delay between cast and damage events, might be possible to generate another imps, those shouldn't count, that's why I use Implosion cast timestamp instead of current pets
      .filter(pet => this._wildImpIds.includes(pet.id) && pet.shouldImplode && !pet.realDespawn)
      .sort((imp1, imp2) => {
        const distance1 = this._getDistance(imp1.x, imp1.y, event.x, event.y);
        const distance2 = this._getDistance(imp2.x, imp2.y, event.x, event.y);
        return distance1 - distance2;
      });
    test && this.log('Implosion damage, Imps to be imploded: ', JSON.parse(JSON.stringify(imps)));
    if (imps.length === 0) {
      debug && this.error('Error during calculating Implosion distance for imps');
      if (!this._getPets(this._lastImplosionCast).some(pet => this._wildImpIds.includes(pet.id))) {
        debug && this.error('No imps');
        return;
      }
      if (!this._getPets(this._lastImplosionCast).some(pet => this._wildImpIds.includes(pet.id) && pet.shouldImplode)) {
        debug && this.error('No implodable imps');
      }
      return;
    }
    imps[0].despawn(event.timestamp, DESPAWN_REASONS.IMPLOSION);
    imps[0].setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.IMPLODED);
    imps[0].pushHistory(event.timestamp, 'Killed by Implosion', event);
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

  _handleImplosionCast(event) {
    // Mark current Wild Imps as "implodable"
    const imps = this.currentPets.filter(pet => this._wildImpIds.includes(pet.id));
    test && this.log('Implosion cast, current imps', JSON.parse(JSON.stringify(imps)));
    if (imps.some(imp => imp.x === null || imp.y === null)) {
      debug && this.error('Implosion cast, some imps don\'t have coordinates', imps);
      return;
    }
    imps.forEach(imp => {
      imp.shouldImplode = true;
      imp.pushHistory(event.timestamp, 'Marked for implosion', event);
    });
    this._lastImplosionCast = event.timestamp;
    this._implosionTargetsHit = [];
  }

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

  _initializeWildImps() {
    // there's very little possibility these statements wouldn't return an object, Hand of Guldan is a key part of rotation
    this._wildImpIds.push(this._toId(PETS.WILD_IMP_HOG.guid));
    if (this.selectedCombatant.hasTalent(SPELLS.INNER_DEMONS_TALENT.id)) {
      // and Inner Demons passively summons these Wild Imps
      this._wildImpIds.push(this._toId(PETS.WILD_IMP_INNER_DEMONS.guid));
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

  _getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

export default DemoPets;

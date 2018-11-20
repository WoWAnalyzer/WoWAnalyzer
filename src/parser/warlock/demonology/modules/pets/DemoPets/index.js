import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import Timeline from '../Timeline';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';
import PetDamage from '../PetDamage';
import PETS from '../PETS';

const debug = false;
const test = false;

  /*
    TEST LOG - http://localhost:3000/report/3WQ2BFC4AJPqDLra/13-LFR+Mythrax+-+Kill+(4:22)/260-Grogar

    BEFORE REFACTOR - data that should remain the same!
      _demonicTyrantBuffEnd: 54150759
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

  _hasDemonicConsumption = false;
  _lastImplosionCast = null;
  _implosionTargetsHit = [];
  _lastDemonicTyrantCast = null;
  _wildImpIds = []; // important for different handling of duration, these IDs change from log to log
  _petsAffectedByDemonicTyrant = []; // dynamic because of talents

  constructor(...args) {
    super(...args);
    this._initializeWildImps();
    this._initializeDemonicTyrantPets();
    this._hasDemonicConsumption = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CONSUMPTION_TALENT.id);
  }

  // Pet timeline

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.IMPLOSION_CAST.id) {
      this._handleImplosionCast(event);
    }
    else if (event.ability.guid === SPELLS.SUMMON_DEMONIC_TYRANT.id) {
      this._handleDemonicTyrantCast(event);
    }
    else if (event.ability.guid === SPELLS.POWER_SIPHON_TALENT.id) {
      this._handlePowerSiphonCast(event);
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

  on_byPlayerPet_cast(event) {
    // handle Wild Imp energy - they should despawn when their energy reaches 0
    if (!this._wildImpIds.includes(event.sourceID)) {
      return;
    }
    const pet = this._getPetFromTimeline(event.sourceID, event.sourceInstance);
    if (!pet) {
      debug && this.error('Wild Imp from cast event not in timeline!', event);
      return;
    }
    if (pet.realDespawn && event.timestamp >= pet.realDespawn) {
      debug && this.error('Wild Imp casted something after despawn', pet, event);
      return;
    }
    const energyResource = event.classResources && event.classResources.find(resource => resource.type === RESOURCE_TYPES.ENERGY.id);
    if (!energyResource) {
      debug && this.error('Wild Imp doesn\'t have energy class resource field', event);
      return;
    }
    pet.updatePosition(event);
    const oldEnergy = pet.currentEnergy;
    const newEnergy = energyResource.amount - (energyResource.cost || 0); // if Wild Imp is extended by Demonic Tyrant, their casts are essentially free, and the 'cost' field is not present in the event
    pet.currentEnergy = newEnergy;
    if (oldEnergy === pet.currentEnergy) {
      // Imp was empowered at least once, mark as empowered
      pet.setMeta(META_CLASSES.EMPOWERED, META_TOOLTIPS.EMPOWERED);
    }
    pet.pushHistory(event.timestamp, 'Cast', event, 'old energy', oldEnergy, 'new energy', pet.currentEnergy);

    if (pet.currentEnergy === 0) {
      pet.despawn(event.timestamp, DESPAWN_REASONS.ZERO_ENERGY);
      pet.pushHistory(event.timestamp, 'Killed by 0 energy', event);
      test && this.log('Despawning Wild Imp', pet);
    }
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.DEMONIC_POWER.id) {
      return;
    }
    // Demonic Tyrant effect faded, update imps' expected despawn
    this._demonicTyrantBuffEnd = event.timestamp;
    const actualBuffTime = event.timestamp - this._lastDemonicTyrantCast;
    this.currentPets
      .filter(pet => this._wildImpIds.includes(pet.id))
      .forEach(imp => {
        // original duration = spawn + 15
        // extended duration on DT cast = (spawn + 15) + 15
        // real duration = (spawn + 15) + actualBuffTime
        const old = imp.expectedDespawn;
        imp.expectedDespawn = imp.spawn + PETS.WILD_IMP_HOG.duration + actualBuffTime;
        imp.pushHistory(event.timestamp, 'Updated expected despawn from', old, 'to', imp.expectedDespawn);
      });
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

  _handleDemonicTyrantCast(event) {
    // extend current pets (not random ones from ID/NP) by 15 seconds
    this._lastDemonicTyrantCast = event.timestamp;
    const affectedPets = this.currentPets.filter(pet => this._petsAffectedByDemonicTyrant.includes(pet.id));
    test && this.log('Demonic Tyrant cast, affected pets: ', JSON.parse(JSON.stringify(affectedPets)));
    affectedPets.forEach(pet => {
      pet.extend();
      pet.pushHistory(event.timestamp, 'Extended with Demonic Tyrant', event);
      // if player has Demonic Consumption talent, kill all imps
      if (this._hasDemonicConsumption && this._wildImpIds.includes(pet.id)) {
        test && this.log('Wild Imp killed because Demonic Consumption', pet);
        pet.despawn(event.timestamp, DESPAWN_REASONS.DEMONIC_CONSUMPTION);
        pet.setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.DEMONIC_CONSUMPTION);
        pet.pushHistory(event.timestamp, 'Killed by Demonic Consumption', event);
      }
    });
    test && this.log('Pets after Demonic Tyrant cast', JSON.parse(JSON.stringify(this.currentPets)));
  }

  _handlePowerSiphonCast(event) {
    if (!event.activeImpsAfterCast || event.activeImpsAfterCast.length === 0) {
      debug && this.error('Power Siphon cast didn\'t have any active imps after cast', event);
    }
    // gets current imps that aren't "scheduled for implosion"
    // filters out only those that aren't active after the cast (they can't be killed because they're casting in the future)
    const currentImps = this.currentPets
      .filter(pet => this._wildImpIds.includes(pet.id) && !pet.shouldImplode)
      .sort((imp1, imp2) => (imp1.currentEnergy - imp2.currentEnergy) || (imp1.spawn - imp2.spawn));
    const filtered = currentImps
      .filter(imp => !event.activeImpsAfterCast.includes(encodeTargetString(imp.id, imp.instance)));
    test && this.log('POWER SIPHON cast', event.timestamp, ', current imps, sorted', JSON.parse(JSON.stringify(currentImps)));
    test && this.log('Imps that AREN\'T active after PS cast, sorted', JSON.parse(JSON.stringify(filtered)));
    // doesn't really make sense - sometimes you have loads of imps to sacrifice, but it doesn't pick them (because they're active after the cast)
    if (filtered.length === 0) {
      // game won't let you cast Power Siphon without available Wild Imps, if cast went through and we don't have Imps, we've done something wrong
      debug && this.error('Something wrong, no Imps found on Power Siphon cast');
      return;
    }
    // kill up to 2 imps
    filtered.slice(0, 2).forEach(imp => {
      imp.despawn(event.timestamp, DESPAWN_REASONS.POWER_SIPHON);
      imp.setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.POWER_SIPHON);
      imp.pushHistory(event.timestamp, 'Killed by Power Siphon', event);
      test && this.log(`Despawning imp`, imp);
    });
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

  _initializeDemonicTyrantPets() {
    const usedPetGuids = [
      PETS.DREADSTALKER.guid,
    ];
    if (this.selectedCombatant.hasTalent(SPELLS.SUMMON_VILEFIEND_TALENT.id)) {
      usedPetGuids.push(PETS.VILEFIEND.guid);
    }
    if (this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id)) {
      usedPetGuids.push(PETS.GRIMOIRE_FELGUARD.guid);
    }

    this._petsAffectedByDemonicTyrant = [
      ...this._wildImpIds,
      ...usedPetGuids.map(guid => this._toId(guid)),
    ];
  }

  _getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

export default DemoPets;

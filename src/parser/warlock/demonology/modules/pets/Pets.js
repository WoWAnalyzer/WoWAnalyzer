import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import PETS from './PET_INFO';

const SUMMON_TO_ABILITY_MAP = {
  // TODO: are these 5 base summons correct?
  [SPELLS.SUMMON_IMP.id]: SPELLS.SUMMON_IMP.id,
  [SPELLS.SUMMON_VOIDWALKER.id]: SPELLS.SUMMON_VOIDWALKER.id,
  [SPELLS.SUMMON_FELHUNTER.id]: SPELLS.SUMMON_FELHUNTER.id,
  [SPELLS.SUMMON_SUCCUBUS.id]: SPELLS.SUMMON_SUCCUBUS.id,
  [SPELLS.SUMMON_FELGUARD.id]: SPELLS.SUMMON_FELGUARD.id,
  [SPELLS.WILD_IMP_HOG_SUMMON.id]: SPELLS.HAND_OF_GULDAN_CAST.id,
  [SPELLS.DREADSTALKER_SUMMON_1.id]: SPELLS.CALL_DREADSTALKERS.id,
  [SPELLS.DREADSTALKER_SUMMON_2.id]: SPELLS.CALL_DREADSTALKERS.id,
  [SPELLS.SUMMON_VILEFIEND_TALENT.id]: SPELLS.SUMMON_VILEFIEND_TALENT.id,
  [SPELLS.GRIMOIRE_FELGUARD_TALENT.id]: SPELLS.GRIMOIRE_FELGUARD_TALENT.id,
  [SPELLS.SUMMON_DEMONIC_TYRANT.id]: SPELLS.SUMMON_DEMONIC_TYRANT.id,
  [SPELLS.WILD_IMP_ID_SUMMON.id]: SPELLS.INNER_DEMONS_TALENT.id,
  // the rest is from Inner Demons / Nether Portal and assigned in _getSummonSpell()
};
const BUFFER = 150;
const IMPLOSION_BUFFER = 50;
const DEMONIC_TYRANT_EXTENSION = 15000;
const debug = false;
const test = false;

class Pets extends Analyzer {
  petDamage = {
    /*
     [pet guid]: {
        name: string,
        instances: {
          [pet instance]: number
        }
        total: number,
     }
     */
  };
  petTimeline = [
    /*
      {
        name: string,
        id: number,
        instance: number | undefined (sometimes),
        spawn: timestamp,
        expectedDespawn: timestamp,
        summonedBy: spellId,

        // in case of Wild Imps, they have additional properties:
        x: number,
        y: number,
        shouldImplode: boolean,
        currentEnergy: number,
        realDespawn: timestamp
      }
     */
  ];

  _hasDemonicConsumption = false;
  _lastIDtick = null;
  _lastSpendResource = null;
  _lastImplosionDamage = null;
  _lastImplosionCast = null;
  _lastPlayerPosition = {
    x: 0,
    y: 0,
  };
  _wildImpIds = []; // important for different handling of duration, these IDs change from log to log
  _petsAffectedByDemonicTyrant = []; // dynamic because of talents

  constructor(...args) {
    super(...args);
    this._initializeWildImps();
    this._initializeDemonicTyrantPets();
    this._hasDemonicConsumption = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CONSUMPTION_TALENT.id);
  }

  // Pet damage

  on_byPlayerPet_damage(event) {
    const petInfo = this._getPetInfo(event.sourceID);
    if (!petInfo) {
      debug && this.error(`Pet damage event with nonexistant pet id ${event.sourceID}`);
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    this._ensurePetInstanceFieldExists(petInfo.guid, petInfo.name, event.sourceInstance);
    this.petDamage[petInfo.guid].instances[event.sourceInstance] += damage;
    this.petDamage[petInfo.guid].total += damage;
    // if it was damage from permanent pet, register it in timeline and put in the beginning
    if (this._isPermanentPet(petInfo.guid) && !this.petTimeline.find(pet => pet.id === event.sourceID)) {
      test && this.log('Permanent pet damage, not in timeline, adding to the front');
      // TODO: might also be solved with a normalizer, putting a summon to the front
      this.petTimeline.unshift({
        name: petInfo.name,
        guid: petInfo.guid,
        id: event.sourceID,
        instance: event.instance,
        spawn: this.owner.fight.start_time,
        expectedDespawn: Infinity,
        realDespawn: null,
        summonedBy: null,
      });
    }
  }

  // Pet timeline

  on_byPlayer_summon(event) {
    const petInfo = this._getPetInfo(event.targetID);
    if (this._isPermanentPet(petInfo.guid)) {
      test && this.log('Permanent pet summon');
      // we summoned a new permanent pet, find last permanent entry in timeline, forcefully despawn it
      const permanentPets = this.petTimeline.filter(pet => this._isPermanentPet(pet.guid));
      if (permanentPets.length > 0) {
        test && this.log('Despawning last permanent pet');
        permanentPets[permanentPets.length - 1].realDespawn = event.timestamp; // not entirely accurate, pet could've died earlier, but there's probably no way of detecting it
      }
    }
    const pet = {
      name: petInfo.name,
      guid: petInfo.guid,
      id: event.targetID,
      instance: event.targetInstance,
      spawn: event.timestamp,
      expectedDespawn: event.timestamp + this._getPetDuration(event.targetID),
      summonedBy: this._getSummonSpell(event),
    };
    if (this._wildImpIds.includes(pet.id)) {
      // Wild Imps need few additional properties
      pet.x = this._lastPlayerPosition.x; // position due to Implosion
      pet.y = this._lastPlayerPosition.y;
      pet.shouldImplode = false;
      pet.currentEnergy = 100; // energy because they can despawn "prematurely" due to their mechanics
      pet.realDespawn = null;
    }
    test && this.log('Pet summoned', pet);
    this.petTimeline.push(pet);
    if (this._getSummonSpell(event) === SPELLS.INNER_DEMONS_TALENT.id) {
      this._lastIDtick = event.timestamp;
    }
  }

  on_byPlayer_spendresource(event) {
    this._lastSpendResource = event.timestamp;
  }

  on_byPlayer_cast(event) {
    this._updatePlayerPosition(event);
    if (event.ability.guid === SPELLS.IMPLOSION_CAST.id) {
      // Implosion cast, mark current Wild Imps as "implodable"
      const imps = this.currentPets.filter(pet => this._wildImpIds.includes(pet.id));
      test && this.log('Implosion cast, current imps', JSON.parse(JSON.stringify(imps)));
      if (imps.some(imp => imp.x === null || imp.y === null)) {
        debug && this.error('Implosion cast, some imps don\'t have coordinates', imps);
        return;
      }
      imps.forEach(imp => {
        imp.shouldImplode = true;
      });
      this._lastImplosionCast = event.timestamp;
    }
    else if (event.ability.guid === SPELLS.SUMMON_DEMONIC_TYRANT.id) {
      // extend current pets (not random ones from ID/NP) by 15 seconds
      const affectedPets = this.currentPets.filter(pet => this._petsAffectedByDemonicTyrant.includes(pet.id));
      test && this.log('Demonic Tyrant cast, affected pets: ', JSON.parse(JSON.stringify(affectedPets)));
      affectedPets.forEach(pet => {
        pet.expectedDespawn += DEMONIC_TYRANT_EXTENSION;
        // if player has Demonic Consumption talent, kill all imps
        if (this._hasDemonicConsumption && this._wildImpIds.includes(pet.id)) {
          test && this.log('Wild Imp killed because Demonic Consumption', pet);
          pet.realDespawn = event.timestamp;
        }
      });
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
    if (this._lastImplosionDamage && event.timestamp <= this._lastImplosionDamage + IMPLOSION_BUFFER) {
      // Implosion is an AOE, discard any damage events that are at same timestamp as the first one encountered
      test && this.log('Implosion damage ignored, too soon');
      return;
    }
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
    imps[0].realDespawn = event.timestamp;
    this._lastImplosionDamage = event.timestamp;
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
    const energyResource = event.classResources && event.classResources.find(resource => resource.type === RESOURCE_TYPES.ENERGY.id);
    if (!energyResource) {
      debug && this.error('Wild Imp doesn\'t have energy class resource field', event);
      return;
    }
    pet.x = event.x;
    pet.y = event.y;
    const newEnergy = energyResource.amount - (energyResource.cost || 0); // if Wild Imp is extended by Demonic Tyrant, their casts are essentially free, and the 'cost' field is not present in the event
    pet.currentEnergy = newEnergy;
    if (pet.currentEnergy === 0) {
      pet.realDespawn = event.timestamp;
      test && this.log('Despawning Wild Imp', pet);
    }
  }

  // to update player position more accurately (based on DistanceMoved)
  // important, since Wild Imp summons uses player position as default (not entirely accurate, as they're spawned around player, not exactly on top of it, but that's as close as I'm gonna get)
  // needed for Implosion - there's a possibility that Wild Imps don't cast anything between their 'summon' and Implosion, therefore I wouldn't get their position

  on_toPlayer_damage(event) {
    this._updatePlayerPosition(event);
  }

  on_toPlayer_energize(event) {
    this._updatePlayerPosition(event);
  }

  on_toPlayer_heal(event) {
    this._updatePlayerPosition(event);
  }

  on_toPlayer_absorbed(event) {
    this._updatePlayerPosition(event);
  }

  // API

  get currentPets() {
    return this._getPets();
  }

  getPetDamage(id, isGuid = true) {
    // isGuid = true, because it's more convenient to call this with getPetDamage(PETS.SOME_PET.guid)
    // because you know what you're looking for (pet IDs change, GUIDs don't)
    const guid = isGuid ? id : this._toGuid(id);
    if (!this.petDamage[guid]) {
      debug && this.error(`this.getPetDamage() called with nonexistant ${isGuid ? 'gu' : ''}id ${id}`);
      return 0;
    }
    return Object.values(this.petDamage[guid].instances).reduce((total, current) => total + current, 0);
  }

  get permanentPetDamage() {
    // haven't observed any real rule for permanent pet guids except the fact, that they're the longest (other pet guids are either 5 or 6 digits)
    let total = 0;
    Object.entries(this.petDamage).filter(([guid]) => guid.length > 6).forEach(([guid, pet]) => {
      total += Object.values(pet.instances).reduce((total, current) => total + current, 0);
    });
    return total;
  }

  getPetCount(timestamp = this.owner.currentTimestamp, petId = null) {
    return this._getPets(timestamp).filter(pet => petId ? pet.id === petId : true).length;
  }

  get petsBySummonAbility() {
    return this.petTimeline.reduce((obj, pet) => {
      const key = pet.summonedBy || 'unknown';
      const spellName = pet.summonedBy ? SPELLS[pet.summonedBy].name : 'unknown';
      obj[key] = obj[key] || { spellName, pets: [] };
      obj[key].pets.push(pet);
      return obj;
    }, {});
  }

  // HELPER METHODS

  _getPets(timestamp = this.owner.currentTimestamp) {
    return this.petTimeline.filter(pet => pet.spawn <= timestamp && timestamp <= (pet.realDespawn || pet.expectedDespawn));
  }

  _getPetFromTimeline(id, instance) {
    return this.petTimeline.find(pet => pet.id === id && pet.instance === instance);
  }

  _isPermanentPet(guid) {
    return guid.toString().length > 6;
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

  _getPetGuid(id, isGuid = false) {
    const pet = this._getPetInfo(id, isGuid);
    return pet ? pet.guid : null;
  }

  _getPetDuration(id, isGuid = false) {
    const pet = this._getPetInfo(id, isGuid);
    if (!pet) {
      debug && this.error(`NewPets._getPetDuration() called with nonexistant pet ${isGuid ? 'gu' : ''}id ${id}`);
      return -1;
    }
    if (this._isPermanentPet(pet.guid)) {
      debug && this.log('Called _getPetDuration() for permanent pet guid');
      return Infinity;
    }
    if (!PETS[pet.guid]) {
      debug && this.error('Encountered pet unknown to PETS.js', pet);
      return -1;
    }
    return PETS[pet.guid].duration;
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

  _ensurePetInstanceFieldExists(guid, name, instance) {
    this.petDamage[guid] = this.petDamage[guid] || { name, instances: {}, total: 0 };
    this.petDamage[guid].instances[instance] = this.petDamage[guid].instances[instance] || 0;
  }

  _getSummonSpell(event) {
    if (!SUMMON_TO_ABILITY_MAP[event.ability.guid]) {
      if (event.timestamp <= this._lastIDtick + BUFFER) {
        return SPELLS.INNER_DEMONS_TALENT.id;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.NETHER_PORTAL_BUFF.id) && event.timestamp <= this._lastSpendResource + BUFFER) {
        return SPELLS.NETHER_PORTAL_TALENT.id;
      }
      debug && this.error('Unknown source of summon event', event);
      return -1;
    }
    return SUMMON_TO_ABILITY_MAP[event.ability.guid];
  }

  _getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  _updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    if (this._lastPlayerPosition.x !== event.x || this._lastPlayerPosition.y !== event.y) {
      this._lastPlayerPosition.x = event.x;
      this._lastPlayerPosition.y = event.y;
    }
  }
}

export default Pets;

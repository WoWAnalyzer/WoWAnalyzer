import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import PETS from './PETS';

/*
  TEST LOGS:
    https://www.warcraftlogs.com/reports/4cBHbZACxz3ywnpk#fight=24&type=damage-done   - Flappslock - THE EVIL ONE (Bilescourge, Vilefiend, Inner Demons, Nether Portal)
    https://www.warcraftlogs.com/reports/QhqzaZTRmWj8d76p#fight=3&type=damage-done    - Katarinna - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/ArRBmMzpYGbV3N7g#fight=11&type=damage-done   - Ddavee - Vilefiend, Inner Demons, Nether Portal     GERMAN LOG
    https://www.warcraftlogs.com/reports/mhaYtBqvg8WTr17A#fight=1&type=damage-done    - Toned - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/TBGRJZ9aj4FzD7wW#fight=1&type=damage-done    - Mímir - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/KFmxXfWN8GtrJT3Y#fight=9&type=damage-done    - Galé  - Soul Strike, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/Lp8vNgYFXdmMqT21#fight=4&type=damage-done    - Cincinnatus - Soul Strike, Inner Demons, Nether Portal
 */
/*
  REQUIRED MODULE API (old Demo issue #1806):
    getPetCount(timestamp, petId?): number - for Sacrificed Souls and perhaps Demonic Consumption
    getPetDamage(petId): number
    getPermanentPetDamage(): number
 */

const SUMMON_TO_ABILITY_MAP = {
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
const debug = true;

class NewPets extends Analyzer {
  /*
    sesbirane informace (z logu Katarinny):
      1) this.owner.playerPets - mel by obsahovat vsechny "this.owner.report.friendlyPets" kde petOwner = playerId
        - je to pole objektu tvaru
          {
            name: string,
            id: number,
            guid: number,
            petOwner: number,
            type: string (pokazde "Pet" ale),
            fights: [
              {
                id: number, (mozna odpovida this.owner.fight.id)
                instances: number
              },
              ...
            ]
        pro tento konkretni log/fight to dela tabulku:

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   55    |   55659
        Dreadstalker        |   46    |   98035
        Demonic Tyrant      |   50    |   135002
        Vilefiend           |   44    |   135816
        Illidari Satyr      |   37    |   136398
        Vicious Hellhound   |   45    |   136399
        Shivarra            |   54    |   136406
        Ur'zul              |   66    |   136402
        Void Terror         |   69    |   136403
        Bilescourge         |   57    |   136404  // NEMA TALENT, takze z ID/NP
        Wrathguard          |   47    |   136407
        Darkhound           |   60    |   136408
        Wild Imp            |   38    |   143622
        Arix-barash         |   36    |   34658669

        pro jiny log (Toned), stejne (relevantni) talenty to da jinou tabulku:

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   45    |   55659
        Dreadstalker        |   47    |   98035
        Demonic Tyrant      |   57    |   135002
        Vilefiend           |   38    |   135816
        Void Terror         |   53    |   136403
        Shivarra            |   52    |   136406
        Wrathguard          |   56    |   136407
        Wild Imp            |   12    |   143622
        Krenkrill           |   19    |   15997656

        pro dalsi log (Mímir) takto (ukazuje to demonic Gateway taky jako pety, id: (83|84), guid (59262|59271)):

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   37    |   55659
        Dreadstalker        |   46    |   98035
        Demonic Tyrant      |   49    |   135002
        Vilefiend           |   48    |   135816
        Illidari Satyr      |   50    |   136398
        Vicious Hellhound   |   43    |   136399
        Ur'zul              |   41    |   136402
        Void Terror         |   90    |   136403
        Bilescourge         |   65    |   136404
        Shivarra            |   52    |   136406
        Wrathguard          |   47    |   136407
        Darkhound           |   64    |   136408
        Wild Imp            |   36    |   143622
        Jhuuzugul           |   32    |   31613885

      Shodne fakta:
        - pokazde vybocuje jeden pet co se tyce guid, predpokladam ze se jedna o permanent peta
        - id nesedi (treba 37 je na jednom logu Illidari Satyr, na jinem Wild Imp)
        - guid ovsem sedi napric logy
          - nekteri peti se asi daji odhadnout na ty baseline:
            - HOG Wild Imp - 55659
            - Dreadstalker - 98035
            - Demonic Tyrant - 135002
            - Vilefiend - 135816
          - prakticky jakykoli jiny pet je random ale jejich guid stale sedi!

  2) parser/shared/modules/Pets - tezce nedostacuje, pro prvni log (Katarinna) loguje pouze id 36 a 46 (Arix-barash, Dreadstalker) - ale to je mozna protoze se to loguje az pri volani get(Source)?Entity()

  3) zatim se neda na prvni pohled zjistit, co z toho je z Inner Demons nebo Nether Portal
   */

  /*
      Timeline handling:
        - need to somehow store "active" pets at the time (to be able to get pets at a certain timestamp)
        - permanent pet most likely won't have cast/summon event as it was summoned prepull
        - pet sources:
          - Hand of Guldan - Wild Imps
          - Call Dreadstalkers - Dreadstalker
          - Summon Vilefiend - Vilefiend
          - Summon Demonic Tyrant - Demonic Tyrant
          - Felguard - Grimoire: Felguard
          - Inner Demons - passively every 12 seconds - Wild Imp + 10% chance of another demon - track last inner demon summon + "tick" period?
          - Nether Portal - 20 second player buff - every time a player spends soul shards, summons a demon

          Bilescourge Bombers talent doesn't summon a pet - it's damage events from player

        - pet durations (awaiting confirmation from warlock DC):
          - HOG Wild Imps - see below
          - Dreadstalkers - 12s
          - Vilefiend - 15s
          - Demonic Tyrant - 15s + buffs other pets (only HOG imps, Dreadstalkers, Vilefiend?, Grimoire: Felguard? or also pets from ID/NP?) by 15s
          - Grimoire: Felguard - 15s
          - Inner Demons - Wild Imps behave same as HOG, random demons seem to be 15 seconds
          - Nether Portal - seem to be 15 seconds
        - apparently when it comes to Wild Imp duration, things get tricky:
          - they spawn with 100 energy, casting Firebolts (reduced by haste)
          - each Firebolt costs 20 energy
          - they despawn when they run out of energy (5 firebolts) OR after 15 seconds (if they got nothing to attack)
          => if there's something to attack, it's basically 10 seconds duration, reduced by haste
          - but it's up to 20 seconds
        - Demonic Tyrant feat. Wild Imps
          - maybe extends their duration as well, but more importantly,
          - DT freezes WI energy (in WI cast events, the "cost" field in classResources is removed, the casts are essentially free)
          - therefore they get the bonus Firebolts out before running out of time
        - one thing to notice - casts from Wild Imps (whether HOG or ID) actually have classResources field with the energy inside, when they're extended with DT, the "cost" field is removed

        - Demonic Tyrant extends other pets - not random pets! should extend HOG Imps (see previous lines), Dreadstalkers, Vilefiend, Grimoire: Felguard, Inner Demons Imps
        - Implosion kills Wild Imps (doesn't produce instakill events anymore, but safe to say, after Implosion cast event, they start flying (interrupting their casts) and after travel time, implode)
        => after Implosion cast/damage, kill Wild Imps

        - SUMMON EVENTS (ability guid, pet type, source)
          - 104317 - Wild Imp - Hand of Guldan (triggered 0.4s after HOG damage event, with each imp arriving 0.4s after the previous one)
          - 193331, 193332 - Dreadstalker - Call Dreadstalkers
          - 264119 - Vilefiend - Summon Vilefiend
          - 111898 - Felguard - Grimoire: Felguard
          - 265187 - Demonic Tyrant - Summon Demonic Tyrant

          - 279910 - Wild Imp - Inner Demons

          - 267992 - Bilescourge - Nether Portal, Inner Demons
          - 267988 - Vicious Hellhound - Nether Portal, Inner Demons
          - 267994 - Shivarra - Nether Portal, Inner Demons
          - 267996 - Darkhound - Nether Portal, Inner Demons
          - 267987 - Illidari Satyr - Nether Portal, Inner Demons
          - 267991 - Void Terror - Nether Portal, Inner Demons
          - 268001 - Ur'zul - Nether Portal, Inner Demons
          - 267995 - Wrathguard - Nether Portal, Inner Demons
          - 267989 - Eye of Gul'dan - Nether Portal, Inner Demons
          (unconfirmed by me - 267986 - Prince Malchezaar - Nether Portal, Inner Demons?)
    */
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
  }

    /*
      General algorithm?
        - all summonable pets have their own summon event, that makes recording their START easy
        - duration however, not so much
        - store `expectedDespawn` timestamp
        - store `source` (or somewhere store IDs of pets affected by Demonic Tyrant)
        - for Wild Imps, probably store the 15 second limit, but also store `casts` (or maybe better `currentEnergy` because of Demonic Tyrant, where energy should stay the same but casts would rise), when energy drops to 0, despawn
        - on Implosion, forcefully kill all active Wild Imps
        - on Demonic Tyrant, iterate through all pets affected, extend their expectedDespawn

      There's no real way to know, when actually pets despawn (no events whatsoever), so I have to rely on their durations + Wild Imp energy for their "real" despawn
   */

  on_byPlayer_summon(event) {
    const pet = {
      name: this._getPetInfo(event.targetID).name,
      id: event.targetID,
      instance: event.targetInstance,
      spawn: event.timestamp,
      expectedDespawn: event.timestamp + this._getPetDuration(event.targetID),
      summonedBy: this._getSummonSpell(event),
    };
    if (this._wildImpIds.includes(pet.id)) {
      pet.x = this._lastPlayerPosition.x;
      pet.y = this._lastPlayerPosition.y;
      pet.shouldImplode = false;
      pet.currentEnergy = 100;
      pet.realDespawn = null; // they can despawn "prematurely" due to their mechanics
    }
    this.petTimeline.push(pet);
    if (this._getSummonSpell(event) === SPELLS.INNER_DEMONS_TALENT.id) {
      this._lastIDtick = event.timestamp;
    }
  }

  on_byPlayer_spendresource(event) {
    this._lastSpendResource = event.timestamp;
  }

  on_byPlayer_cast(event) {
    // log with Demonic Consumption https://www.warcraftlogs.com/reports/bWY1nNdZAX8y7JPQ#fight=6&type=damage-done
    this._updatePlayerPosition(event);
    if (event.ability.guid === SPELLS.IMPLOSION_CAST.id) {
      const imps = this.currentPets.filter(pet => this._wildImpIds.includes(pet.id));
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
      this.currentPets
        .filter(pet => this._petsAffectedByDemonicTyrant.includes(pet.id))
        .forEach(pet => {
          pet.expectedDespawn += DEMONIC_TYRANT_EXTENSION;
          // if player has Demonic Consumption talent, kill all imps
          if (this._hasDemonicConsumption && this._wildImpIds.includes(pet.id)) {
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
       return;
    }
    // handle Implosion, killing imps
    // there's no connection of Implosion event to individual imp
    // but since Implosion pretty much "tells" Imps to start travelling at the same speed towards the target, I could order them by their distance from the target (probably at the time of the cast, so the order doesn't change)
    // then at each individual damage event, erase the imp with least distance
    // since it's AOE, discard every event that comes after that in a small buffer
    const imps = this._getPets(this._lastImplosionCast)
      .filter(pet => this._wildImpIds.includes(pet.id) && pet.shouldImplode) // there's a delay between cast and damage events, might be possible to generate another imps, those shouldn't count
      .sort((imp1, imp2) => {
        const distance1 = this._getDistance(imp1.x, imp1.y, event.x, event.y);
        const distance2 = this._getDistance(imp2.x, imp2.y, event.x, event.y);
        return distance1 - distance2;
      });
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
    // handle Wild Imp energy
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
    const newEnergy = energyResource.amount - (energyResource.cost || 0);
    pet.currentEnergy = newEnergy;
    if (pet.currentEnergy === 0) {
      pet.realDespawn = event.timestamp;
    }
  }

  // to update player position more accurately (based on DistanceMoved)
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
      debug && this.error('Called _getPetDuration() for permanent pet guid');
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
      PETS.DEMONIC_TYRANT.guid,
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

export default NewPets;

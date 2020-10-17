import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';

import DemoPets from './index';
import { isWildImp } from '../helpers';
import { TimelinePet } from '../TimelinePet';
import PETS from '../PETS';
import { SUMMON_TO_SPELL_MAP } from '../CONSTANTS';
import { META_CLASSES } from '../TimelinePet';
import Events from 'parser/core/Events';

const debug = false;
const test = false;
const DEMONIC_POWER_DURATION = 15000;
const BUFFER = 150;

class PetSummonHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _lastDemonicTyrantCast = null;
  _lastIDtick = null;
  _lastSpendResource = null;
  _lastPlayerPosition = {
    x: 0,
    y: 0,
  };

  constructor(options){
    super(options);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.onAbsorb);
  }

  onSummon(event) {
    const petInfo = this.demoPets._getPetInfo(event.targetID);
    if (!petInfo) {
      debug && this.error('Summoned unknown pet', event);
      return;
    }
    if (isPermanentPet(petInfo.guid)) {
      test && this.log('Permanent pet summon');
      this.demoPets.timeline.tryDespawnLastPermanentPet(event.timestamp);
    }
    const pet = new TimelinePet(petInfo,
      event.targetID,
      event.targetInstance,
      event.timestamp,
      this._getPetDuration(event.targetID),
      this._getSummonSpell(event),
      event.ability.guid);
    if (isWildImp(pet.guid)) {
      // Wild Imps need few additional properties
      pet.setWildImpProperties(this._lastPlayerPosition);
    }
    if (petInfo.name === "Demonic Tyrant" && this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CONSUMPTION_TALENT.id)) {
      const power = this.demoPets.currentPets
        .filter(pet => isWildImp(pet.guid))
        .map(pet => pet.currentEnergy)
        .reduce((acc, val) => (acc + val), 0);
      pet.setMeta(META_CLASSES.EMPOWERED, `Empowered by ${(power / 2).toFixed(2)} % from consuming imps`);
    }
    test && this.log('Pet summoned', pet);
    this.demoPets.timeline.addPet(pet);
    pet.pushHistory(event.timestamp, 'Summoned', event);
    if (pet.summonedBy === SPELLS.INNER_DEMONS_TALENT.id) {
      this._lastIDtick = event.timestamp;
    }
  }

  onCast(event) {
    this._updatePlayerPosition(event);
    if (event.ability.guid !== SPELLS.SUMMON_DEMONIC_TYRANT.id) {
      return;
    }
    this._lastDemonicTyrantCast = event.timestamp;
  }

  onSpendResource(event) {
    this._lastSpendResource = event.timestamp;
  }

  // to update player position more accurately (based on DistanceMoved)
  // important, since Wild Imp summons uses player position as default (not entirely accurate, as they're spawned around player, not exactly on top of it, but that's as close as I'm gonna get)
  // needed for Implosion - there's a possibility that Wild Imps don't cast anything between their 'summon' and Implosion, therefore I wouldn't get their position

  onDamageTaken(event) {
    this._updatePlayerPosition(event);
  }

  onEnergize(event) {
    this._updatePlayerPosition(event);
  }

  onHealTaken(event) {
    this._updatePlayerPosition(event);
  }

  onAbsorb(event) {
    this._updatePlayerPosition(event);
  }

  _getPetDuration(id, isGuid = false) {
    const pet = this.demoPets._getPetInfo(id, isGuid);
    if (!pet) {
      debug && this.error(`NewPets._getPetDuration() called with nonexistant pet ${isGuid ? 'gu' : ''}id ${id}`);
      return -1;
    }
    if (isPermanentPet(pet.guid)) {
      debug && this.log('Called _getPetDuration() for permanent pet guid', pet);
      return Infinity;
    }
    if (!PETS[pet.guid]) {
      debug && this.error('Encountered pet unknown to PET_INFO.js', pet);
      return -1;
    }
    // for imps, take Demonic Tyrant in consideration
    // if player doesn't have the buff, it's 15 seconds
    if (isWildImp(pet.guid) && this.selectedCombatant.hasBuff(SPELLS.DEMONIC_POWER.id)) {
      // if player has the buff, it takes the remaining buff time + 15 seconds
      const remainingBuffTime = (this._lastDemonicTyrantCast + DEMONIC_POWER_DURATION) - this.owner.currentTimestamp;
      return PETS[pet.guid].duration + remainingBuffTime;
    }
    return PETS[pet.guid].duration;
  }

  _getSummonSpell(event) {
    if (!SUMMON_TO_SPELL_MAP[event.ability.guid]) {
      if (event.timestamp <= this._lastIDtick + BUFFER) {
        return SPELLS.INNER_DEMONS_TALENT.id;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.NETHER_PORTAL_BUFF.id) && event.timestamp <= this._lastSpendResource + BUFFER) {
        return SPELLS.NETHER_PORTAL_TALENT.id;
      }
      debug && this.error('Unknown source of summon event', event);
      return -1;
    }
    return SUMMON_TO_SPELL_MAP[event.ability.guid];
  }

  _updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this._lastPlayerPosition.x = event.x;
    this._lastPlayerPosition.y = event.y;
  }
}

export default PetSummonHandler;

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { SPELLS_WITH_ENERGY_COST, SPELLS_WITH_HASTE } from '../../Constants';

const debug = false;
const BASE_REGEN = 10;
const MAX_ENERGY = 100;

class Energy extends Module {
  
  energy = [];
  baseHaste = 0;
  currentRegen = 0;
  energyWastedFromBOB = 0;
  energyWastedFromMax = 0;
  timeAtMaxEnergy = 0;
  fightEnd = 0;

  on_initialized() {
    this.baseHaste = this.owner.selectedCombatant.hastePercentage;
    this.currentRegen = this.calcEnergyRegen([this.baseHaste]);
    this.fightEnd = this.owner.fight.end_time;
  }

  // Multiplicative haste bonuses by putting each one in an array and reducing it
  calcEnergyRegen(hasteArray) {
    if (typeof hasteArray === 'object' && hasteArray.reduce) {
      const totalHaste = hasteArray.reduce((total, haste) => total *= (haste + 1), 1);
      return BASE_REGEN * totalHaste;
    }      
    return BASE_REGEN;
  }  
  
  getEnergyAtTime(timestamp) {
    const lastEvent = this.energy[this.energy.length - 1];
    const timeSinceLastAbilityinSecs = (timestamp - lastEvent.timestamp) / 1000;
    const addedEnergy = Math.round(timeSinceLastAbilityinSecs * this.currentRegen);
    const energyAtLastAbility = lastEvent.amount - lastEvent.cost;
    return energyAtLastAbility + addedEnergy;
  }

  calcHowLongAtMax(timestamp) {
    // beginning of the fight you likely start at 100
    if (this.energy.length > 0) {
      const lastEvent = this.energy[this.energy.length - 1];
      const timeSinceLastAbilityinSecs = (timestamp - lastEvent.timestamp) / 1000;
      const energyAtLastAbility = lastEvent.amount - lastEvent.cost;
      const timeToMax = (MAX_ENERGY - energyAtLastAbility) / this.currentRegen;
      return (timeSinceLastAbilityinSecs - timeToMax);
    }
    return 0;
  }

  addEnergyEvent(event, energy, cost) {
    this.energy.push({
      timestamp: event.timestamp, 
      amount: energy,
      cost: cost,
    });
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACK_OX_BREW_TALENT.id === spellId) {
      const currentEnergy = this.getEnergyAtTime(event.timestamp);
      this.energyWastedFromBOB += (100 - currentEnergy);
      this.addEnergyEvent(event, 100, 0);
    }
    if (SPELLS_WITH_ENERGY_COST[spellId] !== undefined) {
      const currentEnergy = event.classResources.filter(a => a.type === RESOURCE_TYPES.ENERGY)[0].amount;
      if (currentEnergy === MAX_ENERGY) {
        const time = this.calcHowLongAtMax(event.timestamp);
        if (time > 0) {
          this.timeAtMaxEnergy += time;
          this.energyWastedFromMax += time * this.currentRegen;
        }
      }
      this.addEnergyEvent(event, currentEnergy, SPELLS_WITH_ENERGY_COST[spellId]);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS_WITH_HASTE[spellId] !== undefined) {
      console.log('hero');
      this.currentRegen = this.calcEnergyRegen([this.baseHaste, SPELLS_WITH_HASTE[spellId] / 100]);
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS_WITH_HASTE[spellId] !== undefined) {
      console.log('hero ended');
      this.currentRegen = this.calcEnergyRegen([this.baseHaste]);
    }
  }

  on_finished() {
    const timeAtEndOfTheFightAtMax = this.calcHowLongAtMax(this.fightEnd);
    if (timeAtEndOfTheFightAtMax > 0) {
      this.timeAtMaxEnergy += timeAtEndOfTheFightAtMax;
      this.energyWastedFromMax += timeAtEndOfTheFightAtMax * this.currentRegen;
    }
    debug && console.log(this.energy);
    debug && console.log('wasted from bob ' + this.energyWastedFromBOB);
    debug && console.log('wasted at max ' + this.energyWastedFromMax);
    debug && console.log('time at max ' + this.timeAtMaxEnergy);
  }  
}

export default Energy;

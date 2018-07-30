import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker'

import Reduction from './Reduction';
import { STATIC_BUFFS, UNKNOWN, ARMOR } from './Constants';

const debug = true;

const REDUCTIONS = [
  ...STATIC_BUFFS,
  UNKNOWN,
  ARMOR,
];

const BUFFER_PERCENT = 0.01;
const ADDITIVE = (accumulator, reduction) => accumulator + reduction.mitigation;
const MULTIPLICATIVE = (accumulator, reduction) => accumulator * (1 - reduction.mitigation);

class DamageMitigation extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  static REDUCTION_CLASS = Reduction;

  reductions = [];
  passives = [];
  totalMitigated = {};

  unknownReduction = null;
  armorReduction = null;

  constructor(...args) {
    super(...args);
    this.reductions = REDUCTIONS.map(options => new this.constructor.REDUCTION_CLASS(this, options));
    this.unknownReduction = this.reductions.find(e => e.name === UNKNOWN.name);
    this.armorReduction = this.reductions.find(e => e.name === ARMOR.name);
    console.log(this.reductions)
    // Find a better place to define this.
    debug && console.log(this.totalMitigated);
  }

  initReduction(reduction) {
    this.totalMitigated[reduction.id] = {
      name: reduction.name,
      amount: 0,
    };
  }

  on_toPlayer_damage(event) {
    if (event.hitType === 10) { // Hit was immuned.
      debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Damage was immuned. Ability: ' + event.ability.name);
      return;
    }
    if (!event.mitigated ) { // No damage was mitigated.
      debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Source target was friendly. Ability: ' + event.ability.name);
      return;
    }
    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Ability: ' + event.ability.name + ', Amount: ' + event.amount + ', Raw: ' + event.unmitigatedAmount + ', Mitigated: ' + event.mitigated + ', ' + formatPercentage(event.mitigated/event.unmitigatedAmount) + '%');
    this.handleEvent(event);
  }

  handleEvent(event) {
    const mitigations = this.passives.slice();

    // Check for active buffs
    this.reductions.forEach(buff => {
      if (this.selectedCombatant.hasBuff(buff.id)){
        mitigations.push(buff);
      }
    });

    // Check if physical damage
    if (event.ability.type === 1) {
      mitigations.push(this.armorReduction);
    }

    debug && console.log(mitigations);

    if (mitigations.length === 0) { // No active mitigations.
      if (!this.totalMitigated[this.unknownReduction.id]) {
        this.initReduction(this.unknownReduction);
      }
      this.totalMitigated[this.unknownReduction.id].amount += event.mitigated;
      return;
    }

    const percentMitigated = event.mitigated/event.unmitigatedAmount;
    const multiplicative = 1 - mitigations.reduce(MULTIPLICATIVE, 1);
    if (percentMitigated + BUFFER_PERCENT < multiplicative) {
      console.warn('The actual percent mitigated was lower than expected given the mitigations active at the time.');
    }
    const unknown = 1 - (1 - percentMitigated) / (1 - multiplicative);
    this.totalMitigated[this.unknownReduction.id].amount += unknown * event.mitigated;

    const additive = mitigations.reduce(ADDITIVE, unknown);
    console.log(additive)
    
    mitigations.forEach(reduction => {
      if (!this.totalMitigated[reduction.id]) {
        this.initReduction(reduction);
      }
      this.totalMitigated[reduction.id].amount += (reduction.mitigation / additive * event.mitigated);
    });
  }
}

export default DamageMitigation;

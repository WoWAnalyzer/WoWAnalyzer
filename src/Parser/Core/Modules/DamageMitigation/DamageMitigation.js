import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

import { STATIC_BUFFS, VARIABLE_PASSIVE } from './Constants';

const debug = true;

const BUFFER_PERCENT = 0.01;
const ADDITIVE = (accumulator, ability) => accumulator + ability.mitigation;
const MULTIPLICATIVE = (accumulator, ability) => accumulator * (1 - ability.mitigation);

class DamageMitigation extends Analyzer {

  passives = [];
  totalMitigated = {};

  constructor(...args) {
    super(...args);
    this.initAbility({ id: -1000, name: 'Unknown'});
    debug && console.log(this.totalMitigated);
  }

  initAbility(ability) {
    this.totalMitigated[ability.id] = {
      name: ability.name,
      amount: 0,
    };
  }

  on_toPlayer_damage(event) {
    if (event.hitType === 10) { // Immune
      debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Damage was immuned. Ability: ' + event.ability.name);
      return;
    }
    if (!event.mitigated ) { // No damage was mitigated
      debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Source target was friendly. Ability: ' + event.ability.name);
      return;
    }
    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Ability: ' + event.ability.name + ', Amount: ' + event.amount + ', Raw: ' + event.unmitigatedAmount + ', Mitigated: ' + event.mitigated + ', ' + formatPercentage(event.mitigated/event.unmitigatedAmount) + '%');
    this.handleEvent(event);
  }

  handleEvent(event) {
    const mitigations = this.passives.slice();
    STATIC_BUFFS.forEach(buff => {
      if (this.selectedCombatant.hasBuff(buff.id)){
        mitigations.push(buff);
      }
    });
    debug && console.log(mitigations);

    if (mitigations.length === 0) { // No active mitigations.
      // Find a good place to define this number as a const.
      this.totalMitigated[-1000].amount += event.mitigated;
      return;
    }

    const percentMitigated = event.mitigated/event.unmitigatedAmount;
    const multiplicative = 1 - mitigations.reduce(MULTIPLICATIVE, 1);
    if (percentMitigated + BUFFER_PERCENT < multiplicative) {
      console.warn('The actual percent mitigated was lower than expected given the mitigations active at the time.');
    }
    const unknown = 1 - (1 - percentMitigated) / (1 - multiplicative);
    this.totalMitigated[-1000].amount += unknown * event.mitigated;

    const additive = mitigations.reduce(ADDITIVE, unknown);
    console.log(additive)

    if (debug) {
      const mitigated = mitigations.map(ability => ({ id: ability.id, name: ability.name, amount: (ability.mitigation / additive * event.mitigated)}));
      console.log(mitigated);
    }
    
    mitigations.forEach(ability => {
      if (!this.totalMitigated[ability.id]) {
        this.initAbility(ability);
      }
      this.totalMitigated[ability.id].amount += (ability.mitigation / additive * event.mitigated);
    });
  }
}

export default DamageMitigation;

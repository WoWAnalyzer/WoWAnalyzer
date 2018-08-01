import React from 'react';
import Tab from 'Interface/Others/Tab';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageMitigationBreakdown from 'Interface/Others/DamageMitigationBreakdown';


import Reduction from './Reduction';
import { BUFFS, DEBUFFS, PASSIVES, UNKNOWN } from './Constants';

const debug = false;

const ACCURACY_THRESHOLD = 0.05;
const BUFFER_PERCENT = 0.01;
const ADDITIVE = (accumulator, reduction) => accumulator + reduction.mitigation * (reduction.stacks ? reduction.stacks : 1);
const MULTIPLICATIVE = (accumulator, reduction) => accumulator * (1 - reduction.mitigation * (reduction.stacks ? reduction.stacks : 1));

class DamageMitigation extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    enemies: EnemyInstances,
    combatants: Combatants,
  };

  static REDUCTION_CLASS = Reduction;

  buffs = [];
  debuffs = [];
  passives = [];
  unknownReduction = null;
  mitigated = {};
  checkSum = 0;

  constructor(...args) {
    super(...args);
    this.addReductions();
  }

  on_finished() {
    if (!debug) {
      return;
    }
    console.log(this.mitigated);
    console.log('Total: ' + this.totalMitigated + ', Checksum: ' + this.checkSum);
    console.log('Unknown: ' + this.mitigated[this.unknownReduction.id].amount + ', ' + formatPercentage(this.mitigated[this.unknownReduction.id].amount / this.totalMitigated) + '%');
  }

  get totalMitigated() {
    let sum = 0;
    Object.keys(this.mitigated).forEach(key => {
      sum += this.mitigated[key].amount;
    });
    return sum;
  }

  get isAccurate() {
    return Math.abs(this.mitigated[this.unknownReduction.id].amount / this.totalMitigated) < ACCURACY_THRESHOLD;
  }

  addReductions() {
    // Buffs
    this.buffs = BUFFS.map(options => new this.constructor.REDUCTION_CLASS(this, options))
    .filter(e => e.enabled);
    // Debuffs
    this.debuffs = DEBUFFS.map(options => new this.constructor.REDUCTION_CLASS(this, options))
    .filter(e => e.enabled);
    // Passives
    this.unknownReduction = new this.constructor.REDUCTION_CLASS(this, UNKNOWN);
    this.passives = PASSIVES.map(options => new this.constructor.REDUCTION_CLASS(this, options))
    .filter(e => e.enabled);
  }

  initReduction(reduction) {
    this.mitigated[reduction.id] = {
      name: reduction.name,
      amount: 0,
    };
  }

  on_toPlayer_damage(event) {
    if (!event.mitigated ) { // No damage was mitigated. Usually direct HP removal, or parry/dodge.
      return;
    }
    this.handleEvent(event);
  }

  handleEvent(event) {
    const mitigated = event.mitigated - (event.blocked ? event.blocked : 0);
    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Ability: ' + event.ability.name + ', Amount: ' + event.amount + (event.block ? ', Blocked: ' + event.block : '') + ', Raw: ' + event.unmitigatedAmount + ', Mitigated: ' + mitigated + ', ' + formatPercentage(mitigated/event.unmitigatedAmount) + '%');
    debug && (this.checkSum += mitigated);
    // Add passives.
    let mitigations = this.passives.slice();

    debug && console.log('Actual armor: ' + event.armor + ', statTracker armor: ' + this.statTracker.currentArmorRating);

    // Check for active buffs.
    const activeBuffs = this.selectedCombatant.activeBuffs();
    activeBuffs.forEach(e => {
      const buff = this.buffs.find(f => f.id === e.ability.guid);
      if (buff) {
        // Special check for Lenience.
        if (buff.id === SPELLS.ATONEMENT_BUFF.id) {
          // If the source combatant does not have the talent, it did not mitigate any damage.
          const players = this.combatants.players;
          const buffSource = players[Object.keys(players).find(f => players[f]._combatantInfo.sourceID === e.sourceID)];
          if (!buffSource.hasTalent(SPELLS.LENIENCE_TALENT.id)) {
            return;
          }
        }
        buff.stacks = e.stacks;
        mitigations.push(buff);
      }
    });

    // Check for active debuffs.
    const enemy = this.enemies.getEntity(event);
    
    if (enemy) {
      const activeBuffs = enemy.activeBuffs();
      activeBuffs.forEach(e => {
        const debuff = this.debuffs.find(f => f.id === e.ability.guid);
        if (debuff) {
          debuff.stacks = e.stacks;
          mitigations.push(debuff);
        }
      });
    }

    // Filter by spell school.
    mitigations = mitigations.filter(e => {
      // If none is set it affects all schools.
      if (e.school === undefined || e.school === null) {
        return true;
      }
      // If it has 0 it includes all magical spell schools (everything except physical).
      if (e.school.includes(0) && event.ability.type !== 1) {
        return true;
      }
      return e.school.includes(event.ability.type);
    });

    if (debug) {
      let names = '';
      mitigations.forEach(e => {
        names += e.name + ', ';
      });
      console.log('Reductions: ' + names);
    }

    if (mitigations.length === 0) { // No active mitigations.
      if (!this.mitigated[this.unknownReduction.id]) {
        this.initReduction(this.unknownReduction);
      }
      this.mitigated[this.unknownReduction.id].amount += mitigated;
      return;
    }

    const percentMitigated = mitigated/event.unmitigatedAmount;
    const multiplicative = 1 - mitigations.reduce(MULTIPLICATIVE, 1);

    if (percentMitigated + BUFFER_PERCENT < multiplicative) {
      console.warn('The actual percent mitigated was lower than expected given the mitigations active at the time. Actual: ' + formatPercentage(percentMitigated) + '%, Expected: ' + formatPercentage(multiplicative) + '%');
    }
    if (percentMitigated - BUFFER_PERCENT > multiplicative) {
      console.warn('The actual percent mitigated was much higher than expected given the mitigations active at the time. Actual: ' + formatPercentage(percentMitigated) + '%, Expected: ' + formatPercentage(multiplicative) + '%');
    }

    const unknown = 1 - (1 - percentMitigated) / (1 - multiplicative);
    if (!this.mitigated[this.unknownReduction.id]) {
      this.initReduction(this.unknownReduction);
    }
    const additive = mitigations.reduce(ADDITIVE, unknown);
    this.mitigated[this.unknownReduction.id].amount += unknown / additive * mitigated;
    
    mitigations.forEach(reduction => {
      if (!this.mitigated[reduction.id]) {
        this.initReduction(reduction);
      }
      const percentContributed = reduction.mitigation / additive * (reduction.stacks ? reduction.stacks : 1);
      this.mitigated[reduction.id].amount += percentContributed * mitigated;
    });
  }

  tab() {
    return {
      title: 'Damage Mitigation',
      url: 'damage-mitigation',
      render: () => (
        <Tab>
          <DamageMitigationBreakdown
            tracker={this}
          />
        </Tab>
      ),
    };
  }
}

export default DamageMitigation;

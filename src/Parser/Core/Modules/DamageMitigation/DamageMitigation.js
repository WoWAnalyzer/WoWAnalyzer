import React from 'react';
import Tab from 'Interface/Others/Tab';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatMilliseconds, formatNumber } from 'common/format';
import SPECS from 'Game/SPECS';
import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageMitigationBreakdown from 'Interface/Others/DamageMitigationBreakdown';


import Reduction from './Reduction';
import AOE_TYPE from './AOE_TYPE';
import AOE_ABILITIES from './AOE_ABILITIES';
import { BUFFS, DEBUFFS, PASSIVES, UNKNOWN } from './Reductions';

const debug = true;

const ACCURACY_THRESHOLD = 0.05;
const BUFFER_PERCENT = 0.01;

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
    console.log('Total: ' + formatNumber(this.totalMitigated) + ', Checksum: ' + formatNumber(this.checkSum));
    console.log('Unknown: ' + formatNumber(this.mitigated[this.unknownReduction.id].amount) + ', ' + formatPercentage(this.mitigated[this.unknownReduction.id].amount / this.totalMitigated) + '%');
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
    this.passives = PASSIVES.map(options => new this.constructor.REDUCTION_CLASS(this, options))
    .filter(e => e.enabled);
    // Unknown
    this.unknownReduction = new this.constructor.REDUCTION_CLASS(this, UNKNOWN);
    this.initReduction(this.unknownReduction);
  }

  initReduction(reduction) {
    this.mitigated[reduction.id] = {
      name: reduction.name,
      amount: 0,
    };
  }

  getMitigation(reduction, event) {
    // Calculate Dampen Harm reduction. 
    if (reduction.id === SPELLS.DAMPEN_HARM_TALENT.id) {
      const percentOfMaxHealth = event.unmitigatedAmount / event.maxHitPoints;
      const mitigation = reduction.mitigation + Math.min(percentOfMaxHealth * 0.257, 0.3); //Number is based on a couple of test logs, not 100% confirmed.
      // debug && console.log('Dampen Harm damage reduction: ' + formatPercentage(mitigation) + '% (' + formatPercentage(percentOfMaxHealth) + '% of max HP)');
      return mitigation;
    }
    return reduction.mitigation * (reduction.stacks ? reduction.stacks : 1);
  }

  on_toPlayer_damage(event) {
    if (!event.mitigated ) { // No damage was mitigated. Usually direct HP removal or parry/dodge.
      return;
    }
    this.handleEvent(event);
  }

  handleEvent(event) {
    let mitigated = event.mitigated - (event.blocked ? event.blocked : 0);
    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time) + ' - Ability: ' + event.ability.name + ', Amount: ' + event.amount + (event.block ? ', Blocked: ' + event.block : '') + ', Raw: ' + event.unmitigatedAmount + ', Mitigated: ' + mitigated + ', ' + formatPercentage(mitigated/event.unmitigatedAmount) + '%');
    debug && console.log('Actual armor: ' + event.armor + ', statTracker armor: ' + this.statTracker.currentArmorRating);
    
    // Add passives.
    let mitigations = this.passives.slice();

    // Check for active buffs.
    const activeBuffs = this.selectedCombatant.activeBuffs();
    activeBuffs.forEach(e => {
      const buffs = this.buffs.filter(f => f.buffId === e.ability.guid || (!f.buffId && f.id === e.ability.guid));
      if (buffs.length > 0) {
        buffs.forEach(buff => {
          // Special check for Lenience.
        if (buff.id === SPELLS.LENIENCE_TALENT.id) {
          // If the source combatant does not have the talent, it did not mitigate any damage.
          const players = this.combatants.players;
          const buffSource = players[Object.keys(players).find(f => players[f]._combatantInfo.sourceID === e.sourceID)];
          if (!buffSource.hasTalent(SPELLS.LENIENCE_TALENT.id)) {
            return;
          }
        }
        buff.stacks = e.stacks;
        mitigations.push(buff);
        });
      }
    });

    // Check for active debuffs.
    const enemy = this.enemies.getEntity(event);
    if (enemy) {
      const activeBuffs = enemy.activeBuffs();
      activeBuffs.forEach(e => {
        const debuffs = this.debuffs.filter(f => f.buffId === e.ability.guid || (!f.buffId && f.id === e.ability.guid));
        if (debuffs.length > 0) {
          debuffs.forEach(debuff => {
            debuff.stacks = e.stacks;
            mitigations.push(debuff);
          });
        }
      });
    }

    // Filter by AOE or non-AOE
    const ability = AOE_ABILITIES.find(e => e.id === event.ability.guid);
    if (ability && ((ability.hit && !event.tick) || (ability.tick && event.tick))) {
      mitigations = mitigations.filter(e => e.aoe !== AOE_TYPE.NON_AOE_ONLY);
    } else {
      mitigations = mitigations.filter(e => e.aoe !== AOE_TYPE.AOE_ONLY);
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

    // No active mitigations. Should never happen since vers is always included.
    if (mitigations.length === 0) {
      console.error('No mitigations found. This should never happen since versatility should always be included (even when you have 0).');
      return;
    }

    const additiveReducer = (accumulator, reduction) => accumulator + this.getMitigation(reduction, event);
    const multiplicativeReducer = (accumulator, reduction) => accumulator * (1 - this.getMitigation(reduction, event));

    const percentMitigated = mitigated/event.unmitigatedAmount;
    const multiplicative = 1 - mitigations.reduce(multiplicativeReducer, 1);
    
    let unknown = 1 - (1 - percentMitigated) / (1 - multiplicative);

    // If the actual percent mitigated is less than expected, it is likely a physical ability not being reduced by armor.
    if (percentMitigated + BUFFER_PERCENT < multiplicative) {
      debug && console.warn('The actual percent mitigated was lower than expected given the mitigations active at the time. Actual: ' + formatPercentage(percentMitigated) + '%, Expected: ' + formatPercentage(multiplicative) + '%');
    }

    // If the actual percent mitigated is higher than expected, try to assign the unknown mitigation.
    if (percentMitigated - BUFFER_PERCENT > multiplicative) {
      debug && console.warn('The actual percent mitigated was much higher than expected given the mitigations active at the time. Actual: ' + formatPercentage(percentMitigated) + '%, Expected: ' + formatPercentage(multiplicative) + '%');
      // If the player is using a shield and the hit was fully absorbed, assume the remaining mitigation was block (Block amount is not in the log when the hit fully absorbed).
      if (event.amount === 0 && (this.selectedCombatant.specId === SPECS.PROTECTION_PALADIN.id || 
        this.selectedCombatant.specId === SPECS.PROTECTION_WARRIOR.id) ) {
        debug && console.log('Removed ' + formatNumber(mitigated * unknown) + ' Damage mitigation assuming it was blocked.');
        mitigated *= 1 - unknown;
        unknown = 0;
      }
    }
    debug && (this.checkSum += mitigated);
    
    const additive = mitigations.reduce(additiveReducer, unknown);
    this.mitigated[this.unknownReduction.id].amount += unknown / additive * mitigated;
    
    mitigations.forEach(reduction => {
      if (!this.mitigated[reduction.id]) {
        this.initReduction(reduction);
      }
      const percentContributed = this.getMitigation(reduction, event) / additive;
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

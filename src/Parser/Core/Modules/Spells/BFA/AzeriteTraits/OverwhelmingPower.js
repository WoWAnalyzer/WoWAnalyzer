import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

const overWhelmingPowerStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.OVERWHELMING_POWER.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

export const STAT_TRACKER = {
  haste: combatant => {
    const opBuffs = combatant.buffs.filter(e => e.ability.guid === SPELLS.OVERWHELMING_POWER_BUFF.id);
    let currentStack = 0;

    if (opBuffs[opBuffs.length - 1] && opBuffs[opBuffs.length - 1].stackHistory) {
      const currentStackEvents = opBuffs[opBuffs.length - 1].stackHistory.sort((a, b) => a.timestamp - b.timestamp);
      currentStack = currentStackEvents[currentStackEvents.length - 1].stacks;
    }

    if (currentStack === 25) {
      console.info("--- applied ---");
    }
    
    console.info(overWhelmingPowerStats(combatant.traitsBySpellId[SPELLS.OVERWHELMING_POWER.id]).haste * currentStack, "haste");
    console.info(currentStack);
    return overWhelmingPowerStats(combatant.traitsBySpellId[SPELLS.OVERWHELMING_POWER.id]).haste * currentStack;
  },
};

/**
 * Meticulous Scheming
 * Gain x haste for 20sec after casting 3 different spells within 8sec after gaining "Meticulous Scheming"
 *
 * Example report: https://www.warcraftlogs.com/reports/jBthQCZcWRNGyAk1#fight=29&type=auras&source=18
 */
class OverWhelmingPower extends Analyzer {
  haste = 0;
  overwhelmingPowerProcs = 0;
  currentStacks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.OVERWHELMING_POWER.id);
    if (!this.active) {
      return;
    }

    const { haste } = overWhelmingPowerStats(this.selectedCombatant.traitsBySpellId[SPELLS.OVERWHELMING_POWER.id]);
    this.haste = haste;
  }

  on_byPlayer_applybuff(event) {
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    this.handleStacks(event);
  }

  handleStacks(event) {
    if (event.ability.guid !== SPELLS.OVERWHELMING_POWER_BUFF.id) {
      return;
    }

    if (event.type === "applybuff") {
      this.overwhelmingPowerProcs += 1;
      this.currentStacks = 25;
    } else if (event.type === "removebuff") {
      this.currentStacks = 0;
    } else {
      this.currentStacks = event.stack;
    }

    console.info(this.currentStacks);
    console.info("----");
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.OVERWHELMING_POWER_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.haste * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.OVERWHELMING_POWER.id}
        value={`${this.averageHaste} Haste`}
        tooltip={`
          ${SPELLS.METICULOUS_SCHEMING.name} grants <b>${this.haste} haste</b> while active.<br/>
          You procced <b>${SPELLS.METICULOUS_SCHEMING_BUFF.name} ${this.meticulousSchemingProcs} times</b> and activated <b>${SPELLS.SEIZE_THE_MOMENT.name} ${this.seizeTheMomentProcs} times</b>.
        `}
      />
    );
  }
}

export default OverWhelmingPower;

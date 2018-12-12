import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';

const MAX_OVERWHELMING_POWER_STACKS = 25;

const overWhelmingPowerStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.OVERWHELMING_POWER.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Overwhelming Power
 * Gain 25 stacks of Overwhelming Power, granting x haste per stack
 * Lose 1 stack each second and when taking damage (has a 1sec ICD independant of the normal decay)
 *
 * Example report: https://www.warcraftlogs.com/reports/jBthQCZcWRNGyAk1#fight=29&type=auras&source=18
 */
class OverWhelmingPower extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  totalHaste = 0;
  lastTimestamp = 0;

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

    this.statTracker.add(SPELLS.OVERWHELMING_POWER_BUFF.id, {
      haste,
    });
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

  on_byPlayer_refreshbuff(event) {
    this.handleStacks(event);
  }

  handleStacks(event) {
    if (event.ability.guid !== SPELLS.OVERWHELMING_POWER_BUFF.id) {
      return;
    }

    if (this.currentStacks !== 0 && this.lastTimestamp !== 0) {
      const uptimeOnStack = event.timestamp - this.lastTimestamp;
      this.totalHaste += this.currentStacks * this.haste * uptimeOnStack;
    }

    if (event.type === "applybuff") {
      this.currentStacks = MAX_OVERWHELMING_POWER_STACKS;
    } else if (event.type === "removebuff") {
      this.currentStacks = 0;
    } else {
      this.currentStacks = event.stack;
    }

    if (this.currentStacks === MAX_OVERWHELMING_POWER_STACKS) {
      this.overwhelmingPowerProcs += 1;
    }

    this.lastTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.OVERWHELMING_POWER_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.totalHaste / this.owner.fightDuration).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.OVERWHELMING_POWER.id}
        value={`${this.averageHaste} average Haste`}
        tooltip={`
          ${SPELLS.OVERWHELMING_POWER.name} grants <b>${this.haste} haste per stack</b> (${this.haste * MAX_OVERWHELMING_POWER_STACKS} haste @${MAX_OVERWHELMING_POWER_STACKS} stacks) while active.<br/>
          You procced <b>${SPELLS.OVERWHELMING_POWER.name} ${this.overwhelmingPowerProcs} times</b> with an uptime of ${formatPercentage(this.uptime)}%.
        `}
      />
    );
  }
}

export default OverWhelmingPower;

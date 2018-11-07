import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const chorusOfInsanityStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.CHORUS_OF_INSANITY.id, rank);
  obj.crit += crit;
  return obj;
}, {
  crit: 0,
});

export const STAT_TRACKER = {
  crit: combatant => {
    return chorusOfInsanityStats(combatant.traitsBySpellId[SPELLS.CHORUS_OF_INSANITY.id]).crit;
  },
};

/**
 * Chorus of Insanity
 * When Voidform ends, gain 32 Critical Strike for each stack of Voidform. This effect decays every 1 sec.
 *
 * Example log: /report/VAZhnPRdxL12w3fG/1-Mythic+G'huun+-+Kill+(8:43)/6-Rxc
 */
class ChorusOfInsanity extends Analyzer {
  crit = 0;
  totalCrit = 0;
  lastTimestamp = 0;

  chorusProcs = 0;
  currentStacks = 0;

  pendingStack = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CHORUS_OF_INSANITY.id);
    if (!this.active) {
      return;
    }

    const { crit } = chorusOfInsanityStats(this.selectedCombatant.traitsBySpellId[SPELLS.CHORUS_OF_INSANITY.id]);
    this.crit = crit;
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
    if (event.ability.guid !== SPELLS.CHORUS_OF_INSANITY_BUFF.id) {
      return;
    }

    if (this.currentStacks !== 0 && this.lastTimestamp !== 0) {
      const uptimeOnStack = event.timestamp - this.lastTimestamp;

      // The first stack only has an apply event, so I have no reference of how many stacks you start with.
      // This check adds the first tick.
      if (this.pendingStack) {
        this.totalCrit += (this.currentStacks + 1) * this.crit * uptimeOnStack;
        this.pendingStack = false;
      }

      this.totalCrit += this.currentStacks * this.crit * uptimeOnStack;
    }

    if (event.type === "applybuff") {
      this.chorusProcs += 1;
      this.pendingStack = true;
    } else if (event.type === "removebuff") {
      this.currentStacks = 0;
    } else {
      this.currentStacks = event.stack;
    }

    this.lastTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CHORUS_OF_INSANITY_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    return (this.totalCrit / this.owner.fightDuration).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CHORUS_OF_INSANITY.id}
        value={`${this.averageCrit} average Crit`}
        tooltip={`
          ${SPELLS.CHORUS_OF_INSANITY.name} grants <b>${this.crit} crit per stack</b><br/>
          You procced <b>${SPELLS.CHORUS_OF_INSANITY.name} ${this.chorusProcs} times</b> with an uptime of ${formatPercentage(this.uptime)}%.
        `}
      />
    );
  }
}

export default ChorusOfInsanity;

import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';
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
  lastTimestamp = 0;
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
    this.pendingStack = true;
    this.lastTimestamp = event.timestamp;
  }

  on_byPlayer_removebuffstack(event) {
    if (this.pendingStack) {
      this.fabricateFirstStack(event);
      this.pendingStack = false;
    }
  }

  fabricateFirstStack(event) {
    this.owner.fabricateEvent({
      timestamp: this.lastTimestamp,
      type: 'applybuffstack',
      currentStacks: event.currentStacks + 1,
    }, event);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CHORUS_OF_INSANITY_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.CHORUS_OF_INSANITY_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.crit;
  }

  get buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.CHORUS_OF_INSANITY_BUFF.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CHORUS_OF_INSANITY.id}
        value={`${formatNumber(this.averageCrit)} average Crit`}
        tooltip={`
          ${SPELLS.CHORUS_OF_INSANITY.name} grants <b>${this.crit} crit per stack</b><br/>
          You procced ${SPELLS.CHORUS_OF_INSANITY.name} <b>${this.buffTriggerCount} times</b> with an uptime of ${formatPercentage(this.uptime)}%.
        `}
      />
    );
  }
}

export default ChorusOfInsanity;

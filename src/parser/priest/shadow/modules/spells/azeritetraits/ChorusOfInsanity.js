import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import CritIcon from 'interface/icons/CriticalStrike';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatTracker from 'parser/shared/modules/StatTracker';
import { EventType } from 'parser/core/Events';

const chorusOfInsanityStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.CHORUS_OF_INSANITY.id, rank);
  obj.crit += crit;
  return obj;
}, {
  crit: 0,
});

/**
 * Chorus of Insanity
 * When Voidform ends, gain 32 Critical Strike for each stack of Voidform. This effect decays every 1 sec.
 *
 * Example log: /report/VAZhnPRdxL12w3fG/1-Mythic+G'huun+-+Kill+(8:43)/6-Rxc
 */
class ChorusOfInsanity extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    statTracker: StatTracker,
  };
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

    this.statTracker.add(SPELLS.CHORUS_OF_INSANITY_BUFF.id, {
      crit,
    });
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
    this.eventEmitter.fabricateEvent({
      ...event,
      timestamp: this.lastTimestamp,
      type: EventType.ApplyBuffStack,
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
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            {SPELLS.CHORUS_OF_INSANITY.name} grants <strong>{this.crit} crit per stack</strong><br />
            You procced {SPELLS.CHORUS_OF_INSANITY.name} <strong>{this.buffTriggerCount} times</strong> with an uptime of {formatPercentage(this.uptime)}%.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CHORUS_OF_INSANITY}>
          <CritIcon /> {formatNumber(this.averageCrit)} <small>average Critical Strike</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default ChorusOfInsanity;

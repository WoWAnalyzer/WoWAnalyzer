import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import DeathDowntime from 'parser/shared/modules/downtime/DeathDowntime';
import SpellLink from 'common/SpellLink';
import { isItAprilFoolDay } from 'common/aprilFools';
import { EventType } from 'parser/core/Events';

class SpiritOfRedemption extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    deathDowntime: DeathDowntime,
  };

  sorStartTime = 0;
  timeSpentRedeeming = 0;
  timeSpendDead = 0;

  get spiritUptime() {
    return this.timeSpentRedeeming;
  }

  get deadTime() {
    return this.deathDowntime.totalDowntime;
  }

  get aliveTime() {
    return this.owner.fightDuration - this.deadTime - this.spiritUptime;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.sorStartTime = event.timestamp;
      this.eventEmitter.fabricateEvent({
        ...event,
        type: EventType.Cast,
      }, event);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.timeSpentRedeeming += event.timestamp - this.sorStartTime;
    }
  }

  get deadTimeThresholds() {
    return {
      actual: this.timeSpentRedeeming,
      isLessThan: {
        minor: 10,
        average: 5,
        major: 1,
      },
      style: 'number',
    };
  }
  suggestions(when) {
    if (isItAprilFoolDay()) {
      when(this.deadTimeThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>We noticed that you didn't die during this encounter. It is recommended that you die within the last 15 seconds of each encounter to make the most of <SpellLink id={SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id} />. If you are having trouble dying, try standing in fire.</>)
            .icon('inv_enchant_essenceeternallarge')
            .actual(`${actual} seconds spent redeeming`)
            .recommended(`${recommended} seconds is recommended`);
        });
    }
  }
}

export default SpiritOfRedemption;

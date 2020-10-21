import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import DeathDowntime from 'parser/shared/modules/downtime/DeathDowntime';
import SpellLink from 'common/SpellLink';
import { isItAprilFoolDay } from 'common/aprilFools';
import Events, { ApplyBuffEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class SpiritOfRedemption extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    deathDowntime: DeathDowntime,
  };
  protected eventEmitter!: EventEmitter;
  protected deathDowntime!: DeathDowntime;

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

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_REDEMPTION_BUFF), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_REDEMPTION_BUFF), this.onRemoveBuff);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.sorStartTime = event.timestamp;
    this.eventEmitter.fabricateEvent({
      ...event,
      type: EventType.Cast,
    }, event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.timeSpentRedeeming += event.timestamp - this.sorStartTime;
  }

  get deadTimeThresholds() {
    return {
      actual: this.timeSpentRedeeming,
      isLessThan: {
        minor: 10,
        average: 5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
  suggestions(when: When) {
    if (isItAprilFoolDay()) {
      when(this.deadTimeThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>We noticed that you didn't die during this encounter. It is recommended that you die within the last 15 seconds of each encounter to make the most of <SpellLink id={SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id} />. If you are having trouble dying, try standing in fire.</>)
            .icon('inv_enchant_essenceeternallarge')
            .actual(i18n._(t('priest.holy.suggestions.spiritOfRedemption.efficiency')`${actual} seconds spent redeeming`))
            .recommended(`${recommended} seconds is recommended`));
    }
  }
}

export default SpiritOfRedemption;

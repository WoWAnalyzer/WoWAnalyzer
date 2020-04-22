import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffStackEvent, RemoveBuffStackEvent, ChangeStatsEvent, FightEndEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';

import Statistic from 'interface/statistics/Statistic';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import { STATISTIC_CATEGORY } from 'interface/others/StatisticBox';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

// https://www.warcraftlogs.com/reports/tq3D9ajfr24nbHFX#fight=3&type=auras&source=18&view=events

class FlashOfInsight extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected readonly statTracker!: StatTracker;

  statAmount: number = 0;
  stack: number = 0;
  timestamp: number = 0;
  durationPerGain: { [amount: number]: number; } = {};

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Flash of Insight");
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_INSIGHT_BUFF), this.stackChange);
    this.addEventListener(Events.ChangeStats.by(SELECTED_PLAYER), this.statChange);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.timestamp = this.owner.fight.start_time;
  }

  stackChange(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    if (this.stack === 0) {
      this.statTracker.addStatMultiplier({ intellect: (1 + event.stack / 100) }, false);
      this.stack = event.stack;
      return;
    }

    this.valueChange(event);

    this.statTracker.removeStatMultiplier({ intellect: (1 + (this.stack / 100)) }, true);
    this.statTracker.addStatMultiplier({ intellect: (1 + (event.stack / 100)) }, true);

    this.timestamp = event.timestamp;
    this.stack = event.stack;
  }

  statChange(event: ChangeStatsEvent) {
    if (!event.delta || !event.delta.intellect || !this.stack) {
      return;
    }

    this.valueChange(event);

    this.timestamp = event.timestamp;
  }

  onFightEnd(event: FightEndEvent) {
    this.valueChange(event);
  }

  valueChange(event: ApplyBuffStackEvent | RemoveBuffStackEvent | ChangeStatsEvent | FightEndEvent) {
    const duration = event.timestamp - this.timestamp;
    if (!duration) {
      return;
    }
    const amount = (this.statTracker.currentIntellectRating - this.statTracker.currentIntellectRating / (1 + (this.stack / 100)));
    if (!this.durationPerGain[amount]) {
      this.durationPerGain[amount] = 0;
    }
    this.durationPerGain[amount] += duration;
  }

  get avgGain() {
    return Object.entries(this.durationPerGain).filter(ms => ms[1] > 0).reduce((total, [amount, duration]) => total + duration / this.owner.fightDuration * Number(amount), 0);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringItemValueText item={ITEMS.MARKOWA}>
          <SpellLink id={SPELLS.FLASH_OF_INSIGHT.id} /><br />
          <PrimaryStatIcon stat={"Intellect"} /> {this.avgGain.toFixed(0)} <small>average Intellect</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default FlashOfInsight;

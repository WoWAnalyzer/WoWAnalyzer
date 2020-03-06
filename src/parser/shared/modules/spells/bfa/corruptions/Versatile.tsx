import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import VersIcon from 'interface/icons/Versatility';
import ArrowIcon from 'interface/icons/UpArrow';
import Events, { ChangeStatsEvent, FightEndEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_CATEGORY } from 'interface/others/StatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const T1_MULTIPLIER = .06;
const T2_MULTIPLIER = .09;
const T3_MULTIPLIER = .12;

class Versatile extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected readonly statTracker!: StatTracker;

  statMultiplier: number = 1;
  timestamp: number = 0;
  durationPerGain: { [amount: number]: number; } = {};

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Versatile");
    if (!this.active) {
      return;
    }

    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.VERSATILE_T1.id) * T1_MULTIPLIER;
    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.VERSATILE_T2.id) * T2_MULTIPLIER;
    this.statMultiplier += this.selectedCombatant.getCorruptionCount(SPELLS.VERSATILE_T3.id) * T3_MULTIPLIER;

    options.statTracker.addStatMultiplier({ versatility: this.statMultiplier });

    this.addEventListener(Events.ChangeStats.by(SELECTED_PLAYER), this.statChange);
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.timestamp = this.owner.fight.start_time;
  }

  statChange(event: ChangeStatsEvent) {
    if (!event.delta || !event.delta.versatility) {
      return;
    }
    this.valueChange(event);
    this.timestamp = event.timestamp;
  }

  onFightEnd(event: FightEndEvent) {
    this.valueChange(event);
  }

  valueChange(event: ChangeStatsEvent | FightEndEvent) {
    const duration = event.timestamp - this.timestamp;
    if (!duration) {
      return;
    }
    const amount = this.statTracker.currentVersatilityRating - this.statTracker.currentVersatilityRating / this.statMultiplier;
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
        <BoringSpellValueText spell={SPELLS.VERSATILE_T3}>
          <ArrowIcon /> {((this.statMultiplier - 1) * 100).toFixed(0)}% <small>Versatility Multiplier</small><br />
          <VersIcon /> {this.avgGain.toFixed(0)} <small>average Versatility gained</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Versatile;

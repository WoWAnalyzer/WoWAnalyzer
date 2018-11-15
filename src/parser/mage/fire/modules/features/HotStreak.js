import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const debug = false;

const PROC_WINDOW_MS = 200;

class HotStreak extends Analyzer {

  totalHotStreakProcs = 0;
  expiredProcs = 0;
  hotStreakRemoved = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST), this.onPyroblastCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.onHotStreakApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.onHotStreakRemoved);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.HOT_STREAK), this.checkForExpiredProcs);

  }

  //When Pyroblast is cast, get the timestamp. This is used for determining if pyroblast was cast immediately before Hot Streak was removed.
  onPyroblastCast(event) {
    this.castTimestamp = event.timestamp;
  }

  //Count the number of times Hot Streak was applied
  onHotStreakApplied() {
    this.totalHotStreakProcs += 1;
  }

  onHotStreakRemoved(event) {
    this.hotStreakRemoved = event.timestamp;
  }

  checkForExpiredProcs(event) {
    if (!this.castTimestamp || this.castTimestamp + PROC_WINDOW_MS < event.timestamp) {
      debug && this.log("Hot Streak proc expired");
      this.expiredProcs += 1;
    }
  }

  get usedProcs() {
    return this.totalHotStreakProcs - this.expiredProcs;
  }

  get expiredProcsPercent() {
    return (this.expiredProcs / this.totalHotStreakProcs) || 0;
  }

  get hotStreakUtil() {
    return 1 - (this.expiredProcs / this.totalHotStreakProcs) || 0;
  }

  get hotStreakUtilizationThresholds() {
    return {
      actual: this.hotStreakUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.hotStreakUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You allowed {formatPercentage(this.expiredProcsPercent)}% of your <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.HOT_STREAK.icon)
          .actual(`${formatPercentage(this.hotStreakUtil)}% expired`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.HOT_STREAK.id} />}
        value={`${formatPercentage(this.hotStreakUtil, 0)} %`}
        label="Hot Streak utilization"
        tooltip={`Hot Streak is a big part of your rotation and therefore it is important that you use all the procs that you get and avoid letting them expire.
        <ul>
          <li>Total procs - ${this.totalHotStreakProcs}</li>
          <li>Used procs - ${this.usedProcs}</li>
          <li>Expired procs - ${this.expiredProcs}</li>
        </ul>`}
      />
    );
  }
}

export default HotStreak;

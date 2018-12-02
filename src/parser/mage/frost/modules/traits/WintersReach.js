import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

const FIGHT_END_BUFFER = 7500;

const debug = false;

class WintersReach extends Analyzer {
  usedProcs = 0;
  totalProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WINTERS_REACH_TRAIT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WINTERS_REACH_BUFF.id) {
      return;
    }
    debug && this.debug("Winter's Reach applied");
    this.totalProcs += 1;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WINTERS_REACH_BUFF.id) {
      return;
    }
    debug && this.debug("Winter's Reach refreshed");
    this.totalProcs += 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLURRY.id) {
      return;
    }

    // If the player had Brain Freeze at the time of casting Flurry, it wasn't a hardcast
    if (this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id, event.timestamp)) {
      return;
    }

    const hadBuff = this.selectedCombatant.hasBuff(SPELLS.WINTERS_REACH_BUFF.id, event.timestamp);
    if (hadBuff) {
      this.usedProcs += 1;
      debug && this.debug("Flurry hardcast with Winter's Reach buff");
    } else {
      debug && this.debug("Flurry hardcast without Winter's Reach buff");
    }
  }

  /*
   * If the player gets a proc within the last 7.5 seconds of the fight then it
   * wont count against them if they dont use it. This is mainly taking into
   * account the reaction time of realizing you have the proc, potentially
   * needing to clear the Brain Freeze procs they already have, the cast time
   * on Flurry, and the travel time for all of the projectiles to hit the target.
   */
  on_fightend() {
    if (this.selectedCombatant.hasBuff(SPELLS.WINTERS_REACH_BUFF.id)) {
      const gracePeriod = this.owner.currentTimestamp - FIGHT_END_BUFFER;
      if (this.selectedCombatant.hasBuff(SPELLS.WINTERS_REACH_BUFF.id, gracePeriod)) {
        debug && this.log("Fight ended with an old unused Winter's Reach buff");
      } else {
        debug && this.log("Fight ended with a newish unused Winter's Reach buff, forgiven");
        this.totalProcs -= 1;
      }
    }
    debug && this.debug("Total Procs: " + this.totalProcs);
    debug && this.debug("Used Procs: " + this.usedProcs);
  }

  get wastedProcs() {
    return this.totalProcs - this.usedProcs;
  }

  get procsPerMinute() {
    return this.totalProcs / (this.owner.fightDuration / 60000);
  }

  get procUtilization() {
    return 1 - (this.wastedProcs / this.totalProcs);
  }

  get procUtilizationThresholds() {
    return {
      actual: this.procUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.procUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.WINTERS_REACH_TRAIT.id} /> procs. These procs make your hard cast <SpellLink id={SPELLS.FLURRY.id} /> casts deal extra damage, so try and use them as quickly as possible to avoid losing over overwriting the procs.</>)
          .icon(SPELLS.WINTERS_REACH_TRAIT.icon)
          .actual(`${formatPercentage(this.procUtilization)}% utilization`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(50)}
        icon={<SpellIcon id={SPELLS.WINTERS_REACH_TRAIT.id} />}
        value={`${formatPercentage(this.procUtilization, 0)} %`}
        label="Winter's Reach utilization"
        tooltip={`This is a measure of how well you utilized your Winter's Reach procs.
        <ul>
          <li>${this.procsPerMinute.toFixed(2)} procs per minute</li>
          <li>${formatNumber(this.usedProcs)} procs used</li>
          <li>${formatNumber(this.wastedProcs)} procs wasted</li>
        </ul>
      `}
      />
    );
  }
}

export default WintersReach;

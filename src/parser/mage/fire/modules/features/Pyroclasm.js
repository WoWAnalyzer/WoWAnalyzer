import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

const CAST_BUFFER = 250;
const FIGHT_END_BUFFER = 5000;
const PYROCLASM_DAMAGE_MODIFIER = 225;

const debug = false;

class Pyroclasm extends Analyzer {

  buffAppliedEvent = null;
  beginCastEvent = null;
  castEvent = null;
  totalProcs = 0;
  usedProcs = 0;
  unusedProcs = 0;
  overwrittenProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST), this.onPyroblastBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST), this.onPyroblastCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRefresh);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  //Gets the Begin Cast Event. This is used for determining if a cast is instant or not.
  onPyroblastBeginCast(event) {
    this.beginCastEvent = event;
  }

  //Gets the Cast Event. This is used for determining if a cast is instant or not.
  onPyroblastCast(event) {
    this.castEvent = event;
  }

  //Counts the number of times Pyroclasm was applied
  onPyroclasmApplied(event) {
    this.totalProcs += 1;
    this.buffAppliedEvent = event;
    debug && this.log("Buff Applied");
  }

  //Checks to see if Pyroclasm was removed because it was used (there was a non instant pyroblast within 250ms) or because it expired.
  onPyroclasmRemoved(event) {
    const isInstantCast = (this.castEvent.timestamp - this.beginCastEvent < CAST_BUFFER);
    if (!isInstantCast && this.castEvent.timestamp > event.timestamp - CAST_BUFFER) {
      this.usedProcs += 1;
    } else {
      this.unusedProcs += 1;
      debug && this.log("Buff Expired");
    }
  }

  //Counts the number of procs that were refreshed. This means that they had 2 procs available and gained another one. Therefore the gained proc is wasted.
  onPyroclasmRefresh(event) {
    this.overwrittenProcs += 1;
    this.totalProcs += 1;
    debug && this.log("Buff Refreshed");
  }

  //If the player has a Pyroclasm proc when the fight ends and they got the proc within the last 5 seconds of the fight, then ignore it. Otherwise, it was wasted.
  onFinished() {
    const hasPyroclasmBuff = this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id);
    const adjustedFightEnding = this.owner.currentTimestamp - FIGHT_END_BUFFER;
    if (hasPyroclasmBuff && this.buffAppliedEvent.timestamp < adjustedFightEnding) {
      this.unusedProcs += 1;
      debug && this.log("Fight ended with an unused proc");
    } else if (hasPyroclasmBuff) {
      this.totalProcs -= 1;
    }
    debug && this.log("Total Procs: " + this.totalProcs);
    debug && this.log("Used Procs: " + this.usedProcs);
    debug && this.log("Unused Procs: " + this.unusedProcs);
    debug && this.log("Refreshed Procs: " + this.overwrittenProcs);
  }

  get wastedProcs() {
    return this.unusedProcs + this.overwrittenProcs;
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
        return suggest(<>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> procs. These procs make your hard cast (non instant) <SpellLink id={SPELLS.PYROBLAST.id} /> casts deal {PYROCLASM_DAMAGE_MODIFIER}% extra damage, so try and use them as quickly as possible so they do not expire or get overwritten.</>)
          .icon(SPELLS.PYROCLASM_TALENT.icon)
          .actual(`${formatPercentage(this.procUtilization)}% utilization`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(100)}
        icon={<SpellIcon id={SPELLS.PYROCLASM_TALENT.id} />}
        value={`${formatPercentage(this.procUtilization, 0)} %`}
        label="Pyroclasm Utilization"
        tooltip={(<>
          This is a measure of how well you utilized your Pyroclasm procs.
          <ul>
            <li>${this.procsPerMinute.toFixed(2)} Procs Per Minute (${this.totalProcs} Total)</li>
            <li>${formatNumber(this.usedProcs)} Procs used</li>
            <li>${formatNumber(this.unusedProcs)} Procs unused/expired</li>
            <li>${formatNumber(this.overwrittenProcs)} Procs overwritten</li>
          </ul>
        </>)}
      />
    );
  }
}

export default Pyroclasm;

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, BeginCastEvent, ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent, RemoveBuffStackEvent, RefreshBuffEvent, FightEndEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber, formatPercentage } from 'common/format';

const CAST_BUFFER = 250;
const FIGHT_END_BUFFER = 5000;
const PYROCLASM_DAMAGE_MODIFIER = 225;

const debug = false;

class Pyroclasm extends Analyzer {

  totalProcs = 0;
  usedProcs = 0;
  unusedProcs = 0;
  overwrittenProcs = 0;
  beginCastEvent?: BeginCastEvent;
  castEvent?: CastEvent;
  buffAppliedEvent?: ApplyBuffEvent | ApplyBuffStackEvent;

  constructor(options: any) {
    super(options);
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
  onPyroblastBeginCast(event: BeginCastEvent) {
    this.beginCastEvent = event;
  }

  //Gets the Cast Event. This is used for determining if a cast is instant or not.
  onPyroblastCast(event: CastEvent) {
    this.castEvent = event;
  }

  //Counts the number of times Pyroclasm was applied
  onPyroclasmApplied(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.totalProcs += 1;
    this.buffAppliedEvent = event;
    debug && this.log("Buff Applied");
  }

  //Checks to see if Pyroclasm was removed because it was used (there was a non instant pyroblast within 250ms) or because it expired.
  onPyroclasmRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (!this.castEvent || !this.beginCastEvent) {
      return;
    }
    const channelingTime = this.castEvent.timestamp - this.beginCastEvent.timestamp;
    const isInstantCast = channelingTime < CAST_BUFFER;
    if (!isInstantCast && this.castEvent.timestamp > event.timestamp - CAST_BUFFER) {
      this.usedProcs += 1;
    } else {
      this.unusedProcs += 1;
      debug && this.log("Buff Expired");
    }
  }

  //Counts the number of procs that were refreshed. This means that they had 2 procs available and gained another one. Therefore the gained proc is wasted.
  onPyroclasmRefresh(event: RefreshBuffEvent) {
    this.overwrittenProcs += 1;
    this.totalProcs += 1;
    debug && this.log("Buff Refreshed");
  }

  //If the player has a Pyroclasm proc when the fight ends and they got the proc within the last 5 seconds of the fight, then ignore it. Otherwise, it was wasted.
  onFinished(event: FightEndEvent) {
    if (!this.buffAppliedEvent) {
      return;
    }
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

  suggestions(when: any) {
    when(this.procUtilizationThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> procs. These procs make your hard cast (non instant) <SpellLink id={SPELLS.PYROBLAST.id} /> casts deal {PYROCLASM_DAMAGE_MODIFIER}% extra damage, so try and use them as quickly as possible so they do not expire or get overwritten.</>)
          .icon(SPELLS.PYROCLASM_TALENT.icon)
          .actual(`${formatPercentage(this.procUtilization)}% utilization`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            This is a measure of how well you utilized your Pyroclasm procs.
            <ul>
              <li>{this.procsPerMinute.toFixed(2)} Procs Per Minute ({this.totalProcs} Total)</li>
              <li>{formatNumber(this.usedProcs)} Procs used</li>
              <li>{formatNumber(this.unusedProcs)} Procs unused/expired</li>
              <li>{formatNumber(this.overwrittenProcs)} Procs overwritten</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PYROCLASM_TALENT}>
          <>
            {formatPercentage(this.procUtilization,0)}% <small>Proc Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Pyroclasm;

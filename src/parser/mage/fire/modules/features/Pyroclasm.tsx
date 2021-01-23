import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { MS_BUFFER_250 } from 'parser/mage/shared/constants';
import { formatNumber, formatPercentage } from 'common/format';
import { Trans } from '@lingui/macro';

const DAMAGE_MODIFIER = 240;
const FIGHT_END_BUFFER = 5000;

const debug = false;

class Pyroclasm extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  }
  protected eventHistory!: EventHistory;

  totalProcs = 0;
  usedProcs = 0;
  unusedProcs = 0;
  overwrittenProcs = 0;
  buffAppliedEvent?: ApplyBuffEvent | ApplyBuffStackEvent;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PYROCLASM_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRemoved);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF), this.onPyroclasmRefresh);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  //Counts the number of times Pyroclasm was applied
  onPyroclasmApplied(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.totalProcs += 1;
    this.buffAppliedEvent = event;
    debug && this.log("Buff Applied");
  }

  //Checks to see if Pyroclasm was removed because it was used (there was a non instant pyroblast within 250ms) or because it expired.
  onPyroclasmRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {

    //If the player hard casts Pyroblast into an instant Pyroblast there will be multiple pyroblast cast events within 250ms. So we need to grab the first one
    const lastPyroblastCast = this.eventHistory.last(undefined , MS_BUFFER_250, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYROBLAST))[0];
    if (!lastPyroblastCast) {
      return;
    }
    const lastPyroblastBeginCast = lastPyroblastCast.channel ? lastPyroblastCast.channel.start : 0;

    if (lastPyroblastCast.timestamp - lastPyroblastBeginCast <= MS_BUFFER_250) {
      this.unusedProcs += 1;
      debug && this.log("Buff Expired");
    } else {
      this.usedProcs += 1;
      debug && this.log("Buff Used");
    }
  }

  //Counts the number of procs that were refreshed. This means that they had 2 procs available and gained another one. Therefore the gained proc is wasted.
  onPyroclasmRefresh() {
    this.overwrittenProcs += 1;
    this.totalProcs += 1;
    debug && this.log("Buff Refreshed");
  }

  //If the player has a Pyroclasm proc when the fight ends and they got the proc within the last 5 seconds of the fight, then ignore it. Otherwise, it was wasted.
  onFinished() {
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.procUtilizationThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You wasted {formatNumber(this.wastedProcs)} of your <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> procs. These procs make your hard cast (non instant) <SpellLink id={SPELLS.PYROBLAST.id} /> casts deal {DAMAGE_MODIFIER}% extra damage, so try and use them as quickly as possible so they do not expire or get overwritten.</>)
          .icon(SPELLS.PYROCLASM_TALENT.icon)
          .actual(<Trans id="mage.fire.suggestions.pyroclasm.wastedProcs">{formatPercentage(this.procUtilization)}% utilization</Trans>)
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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

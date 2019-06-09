import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import StatTracker from 'parser/shared/modules/StatTracker';

import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/7bfnQGY8cKpT94RA#fight=11&source=18&translate=true

class AbyssalSpeakersGauntlets extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  static duration = 60; //seconds
  absorbed = 0;
  lastBuff = this.owner.fight.start_time;
  buffs = 0;
  lostEarly = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasHands(ITEMS.ABYSSAL_SPEAKERS_GAUNTLETS.id);
    if(!this.active){
      return;
    }

    const item = this.selectedCombatant.hands;
    this.hasteRating = calculateSecondaryStatDefault(390, 225, item.itemLevel);
    this.statTracker.add(SPELLS.EPHEMERAL_VIGOR.id, {
      haste: this.hasteRating,
    });
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.EPHEMERAL_VIGOR), this._absorb);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.EPHEMERAL_VIGOR), this._apply);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.EPHEMERAL_VIGOR), this._apply);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.EPHEMERAL_VIGOR), this._remove);
  }

  _apply(event){
    this.lastBuff = event.timestamp;
    this.buffs += 1;
  }

  _remove(event){
    const duration = event.timestamp - this.lastBuff;
    if(duration < this.constructor.duration*1000){
      this.lostEarly += 1;
    }
  }

  _absorb(event){
    this.absorbed += event.amount;
  }

  get buffUptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.EPHEMERAL_VIGOR.id) / this.owner.fightDuration;
  }

  get averageHaste(){
    return this.hasteRating * this.buffUptime;
  }

  get averageDuration(){
    return this.selectedCombatant.getBuffUptime(SPELLS.EPHEMERAL_VIGOR.id) / this.buffs;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Total procs: <b>{this.buffs}</b><br />
            Buffs lost early due to shield depletion: <b>{formatNumber(this.lostEarly)}</b> ({formatPercentage(this.lostEarly / this.buffs)}%)<br />
            Average buff duration: <b>{formatNumber(this.averageDuration / 1000)}s</b> ({formatPercentage(this.averageDuration / (this.constructor.duration*1000))}% of maximum duration)<br />
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.ABYSSAL_SPEAKERS_GAUNTLETS}>
          <UptimeIcon /> {formatPercentage(this.buffUptime, 0)}% <small>uptime</small><br />
          <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste gained</small><br />
          <TooltipElement content={`Damage absorbed: ${formatNumber(this.absorbed)}`}>
            <ItemHealingDone amount={this.absorbed} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default AbyssalSpeakersGauntlets;

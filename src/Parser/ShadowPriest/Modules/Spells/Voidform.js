import React from 'react';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';


import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Tab from 'Main/Tab';

import { formatPercentage, formatNumber } from 'common/format';

import Mindbender from './Mindbender';
import Dispersion from './Dispersion';
import VoidTorrent from './VoidTorrent';
import VoidformsTab from './VoidformsTab';



class Voidform extends Module {
  static dependencies = {
    dispersion: Dispersion,
    voidTorrent: VoidTorrent,
    mindbender: Mindbender,
  };

  _previousVoidformCast = null;
  _totalHasteAcquiredOutsideVoidform = null;
  _totalLingeringInsanityTimeOutsideVoidform = 0;
  _voidformStatistics   = {};
  _inVoidform           = false;
  // _totalHasteAcquired = 0;


  on_initialized() {
    this.active = true;
  }

  get voidformStatistics() {
    return Object.keys(this._voidformStatistics).map(key => this._voidformStatistics[key]);
  }

  get voidformAverageDuration(){
    return this.voidformStatistics.reduce((p, c) => c.excluded ? p : p += c.stacks.length, 0) / this.voidformStatistics.reduce((p, c) => c.excluded ? p : p += 1, 0);
  }

  // excludes dispersion time:
  get voidformUptime(){
    return this.voidformStatistics.reduce((p, c) => p += c.stacks.length, 0) * 1000;
  }

  // full voidform time:
  get voidformTrueUptime(){
    return this.voidformStatistics.reduce((p, c) => c.ended ? p += c.ended - c.start : p, 0);
  }

  get lastVoidformWasExcluded(){
    return this.voidformStatistics.reduce((p, c) => p = c.excluded, false);
  }

  get averageHasteOutsideVoidform(){
    return (1 + this.owner.selectedCombatant.hastePercentage) * (1 + (this._totalHasteAcquiredOutsideVoidform / this._totalLingeringInsanityTimeOutsideVoidform)/100);
  }

  get voidformAverageHaste(){
    const averageHasteFromVoidform = (this.voidformStatistics.reduce((p, c) => p += c.totalHasteAcquired / ((c.ended - c.start)/1000), 0) / this.voidformStatistics.length) / 100;
    return (1 + this.owner.selectedCombatant.hastePercentage) * (1 + averageHasteFromVoidform);
  }

  getCurrentVoidform(){
    if(this._inVoidform){
      return this._voidformStatistics[this._previousVoidformCast.timestamp];
    } else {
      return false;
    }
  }

  setCurrentVoidform(voidform){
    if(this._inVoidform){
      this._voidformStatistics[this._previousVoidformCast.timestamp] = voidform;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOID_ERUPTION.id) {
      return;
    }

    this._inVoidform = true;
    this._previousVoidformCast = event;
    this._voidformStatistics[event.timestamp] = {
      start: event.timestamp,
      stacks: [{
        stack: 1,
        timestamp: event.timestamp,
      }],
      lingeringInsanityStacks: [],
      excluded: false,
      totalHasteAcquired: 0,
    };
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      this._voidformStatistics[this._previousVoidformCast.timestamp].ended = event.timestamp;
      this._inVoidform = false;
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      let currentVoidform = this.getCurrentVoidform();
      currentVoidform = {
        ...currentVoidform,
        totalHasteAcquired: currentVoidform.totalHasteAcquired + event.stack,
        stacks: [
          ...currentVoidform.stacks,
          {
            stack: event.stack,
            timestamp: event.timestamp,
          },
        ],
      };

      this.setCurrentVoidform(currentVoidform);
    }
  }

  on_byPlayer_removebuffstack(event){
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) {
      

      if(this._inVoidform){
        const { timestamp, stack } = event;
        let currentVoidform = this.getCurrentVoidform();
        currentVoidform = {
          ...currentVoidform,
          totalHasteAcquired: currentVoidform.totalHasteAcquired + stack,
          lingeringInsanityStacks: [
            ...currentVoidform.lingeringInsanityStacks,
            {
              stack,
              timestamp,
            },
          ],
        };
        this.setCurrentVoidform(currentVoidform);
      } else {
        this._totalHasteAcquiredOutsideVoidform += event.stack;
        this._totalLingeringInsanityTimeOutsideVoidform += 1;
      }
    }
  }

  on_finished(){
    const player = this.owner.selectedCombatant;
    if(player.hasBuff(SPELLS.VOIDFORM_BUFF.id)){
      // excludes last one to avoid skewing the average:
      const averageVoidformDuration = this.voidformStatistics.slice(0, this.voidformStatistics.length - 1).reduce((p, c) => p += c.stacks.length, 0) / (Object.keys(this._voidformStatistics).length - 1);
      if(averageVoidformDuration < (this.voidformStatistics.reduce((p, c) => p += c.stacks.length, 0) / (Object.keys(this._voidformStatistics).length - 1)) - 5){

        this._voidformStatistics[this._previousVoidformCast.timestamp] = {
          ...this._voidformStatistics[this._previousVoidformCast.timestamp],
          excluded: true,
        };
      }
    }

    // set end to last voidform of the fight:
    if(this._voidformStatistics[this._previousVoidformCast.timestamp].ended === undefined){
      this._voidformStatistics[this._previousVoidformCast.timestamp] = {
        ...this._voidformStatistics[this._previousVoidformCast.timestamp],
        ended: this.owner._timestamp,
      };
    }
  }

  suggestions(when) {
    const { selectedCombatant, fightDuration } = this.owner;
    const uptime = selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id) / (fightDuration - this.dispersion.uptime);


    when(uptime).isLessThan(0.85)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VOIDFORM.id} /> uptime can be improved. Try to maximize the uptime by using <SpellLink id={SPELLS.VOID_TORRENT.id} />, <SpellLink id={SPELLS.MINDBENDER.id} /> at optimal stacks.

            <br /><br />
            Managing your <SpellLink id={SPELLS.VOIDFORM.id} />s is a large part of playing shadow. The recommended way is to try to keep your <SpellLink id={SPELLS.VOIDFORM.id} /> cycles to around 60 seconds each, meaning you will have access to 1 <SpellLink id={SPELLS.VOID_TORRENT.id} /> & 1 <SpellLink id={SPELLS.MINDBENDER.id} /> each <SpellLink id={SPELLS.VOIDFORM.id} />.
            <br /><br />
            A good practice is to use <SpellLink id={SPELLS.VOID_TORRENT.id} /> shortly after entering <SpellLink id={SPELLS.VOIDFORM.id} />. <br/>
            At around 28-33 <SpellLink id={SPELLS.VOIDFORM.id} /> stacks, use <SpellLink id={SPELLS.MINDBENDER.id} />.

            <br /><br />
            <SpellLink id={SPELLS.DISPERSION.id} /> can be used to synchronize your cooldowns back in order or in case of an emergency if you are about to fall out of <SpellLink id={SPELLS.VOIDFORM.id} /> and you have an <SpellLink id={SPELLS.MINDBENDER.id} /> active.
          </span>)
          .icon(SPELLS.VOIDFORM_BUFF.icon)
          .actual(`${formatPercentage(actual)}% Voidform uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended).major(recommended - 0.10);
      });

    when(this.voidformAverageDuration).isLessThan(50)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VOIDFORM.id} /> uptime can be improved. Try to maximize the uptime by using <SpellLink id={SPELLS.VOID_TORRENT.id} />, <SpellLink id={SPELLS.MINDBENDER.id} /> at optimal stacks.

            <br /><br />
            Managing your <SpellLink id={SPELLS.VOIDFORM.id} />s is a large part of playing shadow. The recommended way is to try to keep your <SpellLink id={SPELLS.VOIDFORM.id} /> cycles to around 60 seconds each, meaning you will have access to 1 <SpellLink id={SPELLS.VOID_TORRENT.id} /> & 1 <SpellLink id={SPELLS.MINDBENDER.id} /> each <SpellLink id={SPELLS.VOIDFORM.id} />.
            <br /><br />
            A good practice is to use <SpellLink id={SPELLS.VOID_TORRENT.id} /> shortly after entering <SpellLink id={SPELLS.VOIDFORM.id} />. <br/>
            At around 28-33 <SpellLink id={SPELLS.VOIDFORM.id} /> stacks, use <SpellLink id={SPELLS.MINDBENDER.id} />.

            <br /><br />
            <SpellLink id={SPELLS.DISPERSION.id} /> can be used to synchronize your cooldowns back in order or in case of an emergency if you are about to fall out of <SpellLink id={SPELLS.VOIDFORM.id} /> and you have an <SpellLink id={SPELLS.MINDBENDER.id} /> active.
          </span>)
          .icon(SPELLS.VOIDFORM_BUFF.icon)
          .actual(`${formatNumber(actual)} average Voidform stacks.`)
          .recommended(`>${formatNumber(recommended)} stacks is recommended.`)
          .regular(recommended).major(recommended - 5);
      });
  }

  statistic() {
    return (<StatisticBox
      icon={<SpellIcon id={SPELLS.VOIDFORM.id} />}
      value={`${formatPercentage(this.voidformUptime / (this.owner.fightDuration - this.dispersion.uptime))} %`}
      label={(
        <dfn data-tip={`Time spent in dispersion (${Math.round(this.dispersion.uptime / 1000)} seconds) is excluded from the fight.`}>
          Voidform uptime
        </dfn>
      )}
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);

  tab(){
    return {
      title: 'Voidforms',
      url: 'voidforms',
      render: () => (
        <Tab title="Voidforms">
          <VoidformsTab voidforms={this.voidformStatistics} voidTorrents={this.voidTorrent.voidTorrentsAsArray} mindbenders={this.mindbender.mindbendersAsArray} dispersions={this.dispersion.dispersionsAsArray} fightEnd={this.owner.fight.end_time} />
        </Tab>
      ),
    };
  }

}

export default Voidform;

import React from 'react';
import CoreChanneling from 'parser/shared/modules/Channeling';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage } from 'common/format';


import Analyzer from 'parser/core/Analyzer';

const debug = true;

class SoothingMist extends Analyzer {
  static dependencies = {
    channeling: CoreChanneling,
    statTracker: StatTracker,
  };

  soomTicks = 0;
  gustProc = 0;
  gustsHealing = 0;
  lastSoomTickTimestamp = 0;

  startStamp = 0;
  endStamp = 0;
  soomInProgress = false;
  castsInSoom = 0;
  badSooms = 0;
  totalSoomCasts = 0;

  constructor(...args) {
    super(...args);
    this.assumedGCD = 1500 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating)) *.95;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SOOTHING_MIST.id) {
      this.soomTicks += 1;
      this.lastSoomTickTimestamp = event.timestamp;
    }

    if (spellId === SPELLS.GUSTS_OF_MISTS.id && this.lastSoomTickTimestamp === event.timestamp && this.gustProc < Math.ceil(this.soomTicks/8)) {
      this.gustProc += 1;
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.soomInProgress){
      if(spellId === SPELLS.VIVIFY.id || spellId === SPELLS.ENVELOPING_MIST.id) {
        this.castsInSoom += 1;
      }
      if(spellId === SPELLS.SOOTHING_MIST.id) {//if they refresh soom for some stupid reason
        this.endStamp = event.timestamp;
        this.checkChannelTiming();
        this.castsInSoom = 0;
      }
    }

    if (spellId === SPELLS.SOOTHING_MIST.id) {
      this.startStamp = event.timestamp;
      this.soomInProgress = true;
      const gcd = 1000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
      this.startGCD = Math.max(750, gcd) * .95;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.SOOTHING_MIST.id || !this.soomInProgress) {
      return;
    }
    this.endStamp = event.timestamp;
    this.soomInProgress = false;
    this.checkChannelTiming();
    this.castsInSoom = 0;
    
  }

  checkChannelTiming() {
    this.totalSoomCasts += 1;
    let duration = this.endStamp - this.startStamp;
    
    if (duration < this.startGCD) {
      return;
    }

    duration -= this.startGCD;
    this.castsInSoom -= 1;

    this.castsInSoom -= parseInt(duration / this.assumedGCD);

    if (this.castsInSoom < 0) {
      this.badSooms += 1;
    }
  }

  on_fightend() {
    if (this.soomInProgress) {
      this.endStamp = this.selectedCombatant.fightDuration;
      this.checkChannelTiming();
    }
    if (debug) {
      console.log(`SooM Ticks: ${this.soomTicks}`);
      console.log('SooM Perc Uptime: ', (this.soomTicks * 2 / this.owner.fightDuration * 1000));
      console.log('SooM Buff Update: ', this.selectedCombatant.getBuffUptime(SPELLS.SOOTHING_MIST.id), ' Percent: ', this.selectedCombatant.getBuffUptime(SPELLS.SOOTHING_MIST.id) / this.owner.fightDuration);
      console.log('soom gusts', this.gustsHealing);

      console.log('Total casts: ', this.totalSoomCasts);
      console.log('Bad casts: ', this.badSooms);
      console.log('Threshold casts: ', this.soomThresholds);
    }
  }

  get soomTicksPerDuration() {
    const soomTicks = (this.soomTicks * 2 / this.owner.fightDuration * 1000) || 0;
    return soomTicks >= 1.5;
  }

  get suggestionThresholds() {
    return {
      actual: this.soomTicksPerDuration,
      isEqual: true,
      style: 'boolean',
    };
  }

  get soomThresholds(){
    return (this.totalSoomCasts - this.badSooms) / this.totalSoomCasts;
  }

  get suggestionThresholdsCasting(){
    return {
      actual: this.soomThresholds,
      isLessThan: {
        minor: 1,
        average: .95,
        major: .9,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest) => {
        return suggest(
          <>
            You are allowing <SpellLink id={SPELLS.SOOTHING_MIST.id} /> to channel for an extended period of time. <SpellLink id={SPELLS.SOOTHING_MIST.id} /> does little healing, so your time is better spent DPS'ing throug the use of <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} />.
          </>
        )
          .icon(SPELLS.SOOTHING_MIST.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });

    when(this.suggestionThresholdsCasting).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You were channeling <SpellLink id={SPELLS.SOOTHING_MIST.id} /> without casting spells during it. Replace this channel time with damage abilities like <SpellLink id={SPELLS.RISING_SUN_KICK.id} />.
        </>
      )
        .icon(SPELLS.SOOTHING_MIST.icon)
        .actual(`${formatPercentage(this.badSooms / this.totalSoomCasts)} % of Soothing Mist casts with max spells casted`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default SoothingMist;

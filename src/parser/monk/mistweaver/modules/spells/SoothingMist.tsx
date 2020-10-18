import React from 'react';
import CoreChanneling from 'parser/shared/modules/Channeling';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage } from 'common/format';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class SoothingMist extends Analyzer {
  static dependencies = {
    channeling: CoreChanneling,
    statTracker: StatTracker,
  };

  protected channeling!: CoreChanneling;
  protected statTracker!: StatTracker;

  soomTicks: number = 0;
  gustProc: number = 0;
  gustsHealing: number = 0;
  lastSoomTickTimestamp: number = 0;

  startStamp: number = 0;
  endStamp: number = 0;
  soomInProgress: boolean = false;
  castsInSoom: number = 0;
  badSooms: number = 0;
  totalSoomCasts = 0;

  assumedGCD: number = 0;
  startGCD: number = 0;

  constructor(options: Options){
    super(options);
    this.assumedGCD = 1500 *.95;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOOTHING_MIST), this.castSoothingMist);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, SPELLS.ENVELOPING_MIST]), this.castDuringSoothingMist);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SOOTHING_MIST), this.handleSoothingMist);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.masterySoothingMist);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOOTHING_MIST), this.removeBuffSoothingMist);
    this.addEventListener(Events.fightend, this.end);
  }

  handleSoothingMist(event: HealEvent) {
    this.soomTicks += 1;
    this.lastSoomTickTimestamp = event.timestamp;
  }

  masterySoothingMist(event: HealEvent) {
    if (this.lastSoomTickTimestamp === event.timestamp && this.gustProc < Math.ceil(this.soomTicks / 8)) {
      this.gustProc += 1;
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  castDuringSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
      this.castsInSoom += 1;
    }
  }

  castSoothingMist(event: CastEvent) {
    if (this.soomInProgress) {
    //if they refresh soom for some stupid reason
      this.endStamp = event.timestamp;
      this.checkChannelTiming();
      this.castsInSoom = 0;
    }

    this.startStamp = event.timestamp;
    this.soomInProgress = true;
    const gcd = 1000 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.startGCD = Math.max(750, gcd) * .95;
  }

  removeBuffSoothingMist(event: RemoveBuffEvent) {
    if (!this.soomInProgress) {
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

    this.castsInSoom -= (duration / this.assumedGCD);

    if (this.castsInSoom < 0) {
      this.badSooms += 1;
    }
  }

  end(event: FightEndEvent) {
    if (this.soomInProgress) {
      this.endStamp = this.owner.fightDuration;
      this.checkChannelTiming();
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
      style: ThresholdStyle.BOOLEAN,
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) => suggest(
          <>
            You are allowing <SpellLink id={SPELLS.SOOTHING_MIST.id} /> to channel for an extended period of time. <SpellLink id={SPELLS.SOOTHING_MIST.id} /> does little healing, so your time is better spent DPS'ing through the use of <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} />.
          </>,
        )
          .icon(SPELLS.SOOTHING_MIST.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR));

    when(this.suggestionThresholdsCasting).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You were channeling <SpellLink id={SPELLS.SOOTHING_MIST.id} /> without casting spells during it. Replace this channel time with damage abilities like <SpellLink id={SPELLS.RISING_SUN_KICK.id} />.
        </>,
      )
        .icon(SPELLS.SOOTHING_MIST.icon)
        .actual(`${formatPercentage(this.badSooms / this.totalSoomCasts)}${i18n._(t('monk.mistweaver.suggestions.soothingMist.channelingWithoutCastingSpells')`% of Soothing Mist casts with max spells casted`)}`)
        .recommended(`${recommended} is recommended`));
  }
}

export default SoothingMist;

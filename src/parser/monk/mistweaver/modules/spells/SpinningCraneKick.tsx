import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { formatMilliseconds } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class SpinningCraneKick extends Analyzer{
  constructor(options: Options){
    super(options);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK), this.castSpinningCraneKick);
        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK), this.handleSpinningCraneKick);
        this.addEventListener(Events.fightend, this.fightEnd);
    }

    goodSCKcount: number = 0;
    goodSCKTimeList: string[] = [];
    badSCKcount: number = 0;
    badSCKTimeList: string[] = [];
    canceledSCKcount: number = 0;//figure out if this is possible
    enemiesHitSCK: string[] = [];
    currentTime: number = 0;

    castSpinningCraneKick(event: CastEvent) {
        if (this.enemiesHitSCK.length > 0) { //this nested is needed due to weird logs
            this.checkSCK();
        }
        this.currentTime = this.owner.currentTimestamp - this.owner.fight.start_time;
        this.enemiesHitSCK = [];
    }

    //tracking channel time isn't needed due to the fact it is the same as a gcd so they have to have another cast event
    handleSpinningCraneKick(event: DamageEvent) {
        const enemy = `${event.targetID} ${event.targetInstance || 0}`;
        if (!this.enemiesHitSCK.includes(enemy)) {
            this.enemiesHitSCK.push(enemy);
        }
    }

    fightEnd(event: FightEndEvent){
        if (this.enemiesHitSCK) {
            this.checkSCK();
        }
    }

    checkSCK(){
        if (this.enemiesHitSCK.length > 2) {
            this.goodSCKcount += 1;
            this.goodSCKTimeList.push(formatMilliseconds(this.currentTime));
        } else {
            this.badSCKcount += 1;
            this.badSCKTimeList.push(formatMilliseconds(this.currentTime));
        }
    }

    get suggestionThresholds() {
        return {
          actual: this.badSCKcount,
          isGreaterThan: {//following the tft logic of one is okay anymore is bad
            minor: 1,
            average: 1.5,
            major: 2,
          },
          style: ThresholdStyle.NUMBER,
        };
      }

    suggestions(when: When) {
        when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
              <>
                You are not utilizing your <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> spell as effectively as you should. You should work on both your positioning spell. Always aim for the highest concentration of enemies, which is normally melee.
              </>,
            )
              .icon(SPELLS.SPINNING_CRANE_KICK.icon)
              .actual(`${this.badSCKcount}${i18n._(t('monk.mistweaver.suggestions.spinningCraneKick.efficiency')` Spinning Crane Kicks that hit fewer than 3 enemies`)}`)
              .recommended('Aim to hit 3 or more targets with Spinning Crane Kick if there is less than 3 targets then Rising Sunkick, Blackout Kick or Tiger\'s palm'));
      }

}

export default SpinningCraneKick;

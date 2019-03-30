import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import { formatMilliseconds } from 'common/format';

const debug = false;

class SpinningCraneKick extends Analyzer{
    
    goodSCKcount = 0;
    goodSCKTimeList = [];
    badSCKcount = 0;
    badSCKTimeList = [];
    canceledSCKcount = 0;//figure out if this is possible
    enemiesHitSCK;
    currnetTime = 0;

    on_byPlayer_cast(event){
        const spellId = event.ability.guid;

        if(spellId === SPELLS.SPINNING_CRANE_KICK.id){
            if(this.enemiesHitSCK){//this nested is needed due to weird logs
                this.checkSCK();
            }
            this.currnetTime = this.owner.currentTimestamp - this.owner.fight.start_time;
            this.enemiesHitSCK = [];
        }
    }

    //tracking channel time isn't needed due to the fact it is the same as a gcd so they have to have another cast event
    on_byPlayer_damage(event){
        const spellId = event.ability.guid;

        if(spellId === SPELLS.SPINNING_CRANE_KICK_DAMAGE.id && !this.enemiesHitSCK.includes(event.targetID)){
            this.enemiesHitSCK.push(event.targetID + " " + event.targetInstance);
        }
    }

    on_fightend(){
        if(this.enemiesHitSCK){
            this.checkSCK();
        }
        if(debug){
            console.log("Good casts: " + this.goodSCKcount);
            console.log("Good casts Time: " + this.goodSCKTimeList);
            console.log("Bad casts: " + this.badSCKcount);
            console.log("Bad casts Time: " + this.badSCKTimeList);
        }
    }

    checkSCK(){
        if(this.enemiesHitSCK.length>2){
            this.goodSCKcount += 1;
            this.goodSCKTimeList.push(formatMilliseconds(this.currnetTime));
        }
        else{
            this.badSCKcount += 1;
            this.badSCKTimeList.push(formatMilliseconds(this.currnetTime));
        }
        this.enemiesHitSCK = null;
    }

    get suggestionThresholds() {
        return {
          actual: this.badSCKcount,
          isGreaterThan: {//following the tft logic of one is okay anymore is bad
            minor: 1,
            average: 1.5,
            major: 2,
          },
          style: 'number',
        };
      }

    suggestions(when) {
        when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
            return suggest(
              <>
                You are not utilizing your <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> talent as effectively as you should. You should work on both your positioning and aiming of the spell. Always aim for the highest concentration of players, which is normally melee.
              </>
            )
              .icon(SPELLS.SPINNING_CRANE_KICK.icon)
              .actual(`${this.badSCKcount} Number of Spinning Crane Kicks with 1 or 0`)
              .recommended('Aim to hit 2 or more targets with Spinning Crane Kick if there is only one Rising Sunkick, Blackout Kick or Tiger\'s palm will do more will do more damage');
          });
      }

}

export default SpinningCraneKick;

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';


const debug = true;

class AprilFools extends Analyzer {

  rollCount = 0;//track number of rolls
  rollCD;

  constructor(...args) {
    super(...args);
    this.rollCD = 20;
    if(this.selectedCombatant.hasTalent(SPELLS.CELERITY_TALENT.id)){
        this.rollCD = 15;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    
    if (!(SPELLS.ROLL.id === spellId || SPELLS.CHI_TORPEDO_TALENT.id === spellId)) {//bail early if not the right spell
      return;
    }
    this.rollCount += 1;
  }


  get ratioOfRolls(){//assumes you have 2/3 roll stacks at the start 
    let maxRolls = 0;
    const fightLengthSeconds = this.owner.fightDuration/1000;
    if(this.rollCD === 15){
      maxRolls = fightLengthSeconds/15 + 3;//max rolls to get back from cd + how many you have at the start
    }
    else{
      maxRolls = fightLengthSeconds/20 + 2;
    }
    maxRolls = maxRolls + 5; //this is dirty but like lets make sure they can't have 100%
    return this.rollCount / maxRolls;
  }

  get suggestionThresholds() {
    return {
      actual: this.ratioOfRolls,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
    style: 'percentage',
    };
  }


  suggestions(when) {
    const now = new Date();
    if((now.getMonth() === 3 && now.getDate() === 1) || debug){
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            You are not doing enough barrel <SpellLink id={SPELLS.ROLL.id} />s. Peppy would be very ashamed.
          </>
          )
          .icon(SPELLS.ROLL.icon)
          .actual(`Do a barrel roll`)
          .recommended(`Z or R twice`);
      });
    }
  }

}

export default AprilFools;
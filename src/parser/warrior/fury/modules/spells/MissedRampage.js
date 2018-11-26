import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

import SpellLink from 'common/SpellLink';

const rageGenerators = [
  SPELLS.RAGING_BLOW,
  SPELLS.BLOODTHIRST,
  SPELLS.EXECUTE_FURY,
  SPELLS.WHIRLWIND_FURY,
  SPELLS.FURIOUS_SLASH_TALENT,
  SPELLS.SIEGEBREAKER_TALENT,
  SPELLS.DRAGON_ROAR_TALENT,
  SPELLS.BLADESTORM_TALENT,
];

class MissedRampage extends Analyzer {
  missedRampages = 0;
  hasFB = false;

  constructor(...args) {
    super(...args);

    this.active = true;
    this.hasFB = this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
    
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(rageGenerators), this.onPlayerCast);
  }

  onPlayerCast(event) {
    const rage = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.RAGE.id);
    if (!rage) {
      return;
    }
    console.log("HasFB:" + this.hasFB);
    if (rage >= 90) {
      this.missedRampages += 1;
    }
  }

  get suggestionThresholds() {
    if (this.hasFB === true) {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 0,
          major: 0,
        },
        style: 'number',
      };
    } else {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 5,
          major: 10,
        },
        style: 'number',
      };
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          There were {actual} times you casted a rage generating ability when you should have cast <SpellLink id={SPELLS.RAMPAGE.id} />.
        </>
      )
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${actual} missed Rampages.`)
        .recommended(`${recommended} is recommended.`);
        
    });
  }
}

export default MissedRampage;

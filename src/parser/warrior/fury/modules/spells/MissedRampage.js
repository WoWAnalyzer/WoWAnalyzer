import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SpellLink from 'common/SpellLink';

const GENERATORS = [
  SPELLS.RAGING_BLOW.id,
  SPELLS.BLOODTHIRST.id,
  SPELLS.EXECUTE.id,
];

class MissedRampage extends Analyzer {
  missedRampages = 0;

  isGenerator(spellId) {
    return GENERATORS.includes(spellId);
  }

  on_byPlayer_cast(event) {
    const resource = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.RAGE.id);
    if (!resource) {
      return;
    }
    const rage = Math.floor(resource.amount/10);
    if (rage >= 90 && this.isGenerator(event.ability.guid)) {
      this.missedRampages += 1;
    }
  }

  get suggestionThresholds() {
    let s_Major = 10;

    if (this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id)) {
      s_Major = 0;
    }

    return {
      actual: this.missedRampages,
      isGreaterThan: {
        minor: 0,
        average: 5,
        major: s_Major,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          There were {actual} times when you cast another ability when you should have cast <SpellLink id={SPELLS.RAMPAGE.id} />.
        </>
      )
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${actual} missed Rampages.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default MissedRampage;

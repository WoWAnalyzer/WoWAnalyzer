import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SpellLink from 'common/SpellLink';
const debug = false;

const GENERATORS = [
  SPELLS.RAGING_BLOW,
  SPELLS.BLOODTHIRST,
  SPELLS.EXECUTE,
];

class MissedRampage extends Analyzer {
  missedRampages = 0;
  Enraged = false;
  rampage_cost = 85;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.CARNAGE_TALENT.id)) {
      this.rampage_cost = 75;
    } else if (this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id)) {
      this.rampage_cost = 95;
    }
  }

  isGenerator(spellId) {
    return !!GENERATORS.find(generator => generator.id === spellId);
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

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          There were {actual} times when you cast another ability when you should have cast <SpellLink id={SPELLS.RAMPAGE.id} />.
        </React.Fragment>
      )
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${actual} missed Rampages.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default MissedRampage;

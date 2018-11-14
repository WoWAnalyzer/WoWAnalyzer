import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const RAMPAGE_HITS_PER_CAST = 4;
const GENERATORS = [
  SPELLS.RAGING_BLOW.id,
  SPELLS.BLOODTHIRST.id,
  SPELLS.EXECUTE.id,
];

class Rampage extends Analyzer {
  // Rampage is in fact 5 separate spells cast in this sequence
  rampage = [SPELLS.RAMPAGE_1.id, SPELLS.RAMPAGE_2.id, SPELLS.RAMPAGE_3.id, SPELLS.RAMPAGE_4.id];
  counter = {};

  missedRampages = 0;

  constructor(...args) {
    super(...args);
    for (let i = 0; i < this.rampage.length; i++) {
      this.counter[this.rampage[i]] = 0;
    }
  }

  isGenerator(spellId) {
    return GENERATORS.includes(spellId);
  }

  on_byPlayer_cast(event) {
    const resource = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.RAGE.id);
    if (!resource) {
      return;
    }
    const rage = Math.floor(resource.amount / 10);
    if (rage >= 90 && this.isGenerator(event.ability.guid)) {
      this.missedRampages += 1;
    }
  }

  on_byPlayer_damage(event) {
    if (!this.rampage.includes(event.ability.guid)) {
      return;
    }
    this.counter[event.ability.guid] += 1;
  }

  get cancelledsuggestionThresholds() {
    const max = Object.values(this.counter).reduce((max, current) => current > max ? current : max, 0);
    const wasted = Object.keys(this.counter).reduce((acc, current) => acc + max - this.counter[current], 0);

    return {
      actual: wasted / (max * RAMPAGE_HITS_PER_CAST),
      isGreaterThan: {
        minor: 0,
        average: 0.02,
        major: 0.05,
      },
      style: 'percentage',
    };
  }

  get missedSuggestionThresholds() {
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
    when(this.cancelledsuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.RAMPAGE.id} /> cast are being cancelled prematurely. Be sure to be facing the target within melee distance to avoid this.</>)
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${formatPercentage(actual)}% of your Rampage hits were cancelled.`)
        .recommended(`${recommended}% is recommended`);
    });
    when(this.missedSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>There were {actual} times when you cast another ability when you should have cast <SpellLink id={SPELLS.RAMPAGE.id} />.</>)
        .icon(SPELLS.RAMPAGE.icon)
        .actual(`${actual} missed Rampages.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default Rampage;

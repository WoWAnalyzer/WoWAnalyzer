import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';

class CastsInStealthBase extends Analyzer {
  constructor(...args) {
    super(...args);

    this.backstabSpell = this.selectedCombatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id) 
    ? SPELLS.GLOOMBLADE_TALENT 
    : SPELLS.BACKSTAB;
    this.badStealthSpells = [this.backstabSpell];
  }
  backstabSpell = null;
  badStealthSpells = [];
  stealthCondition = '';
  maxCastsPerStealth = 0;

  createWrongCastThresholds(spell, tracker) {
    return {
      actual: tracker.getAbility(spell.id).casts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestWrongCast(when, spell, thresholds) {
    when(thresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={spell.id} /> during {this.stealthCondition}. </React.Fragment>)
          .icon(spell.icon)
          .actual(`${actual} ${spell.name} casts`)
          .recommended(`${recommended} is recommended`);
      });
  }

  validStealthSpellIds = [
    SPELLS.BACKSTAB.id,
    SPELLS.GLOOMBLADE_TALENT.id,
    SPELLS.SHURIKEN_STORM.id,
    SPELLS.SHADOWSTRIKE.id,
    SPELLS.NIGHTBLADE.id,
    SPELLS.EVISCERATE.id,
    SPELLS.SHURIKEN_TORNADO_TALENT.id,
    SPELLS.SECRET_TECHNIQUE_TALENT.id,
  ]

  get stealthMaxCasts() {
    return 0;
  }
  get stealthActualCasts() {
    return 0;
  }
  
  get castsInStealthThresholds() {
    return {
      actual: this.stealthActualCasts / this.stealthMaxCasts,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestAvgCasts(when, spell) {
    when(this.castsInStealthThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Try to cast {this.maxCastsPerStealth} spells during {this.stealthCondition}</React.Fragment>)
          .icon(spell.icon)
          .actual(`${this.stealthActualCasts} casts out of ${this.stealthMaxCasts} possible.`)
          .recommended(`${this.maxCastsPerStealth} in each ${this.stealthCondition} window`);
      });
  }
}

export default CastsInStealthBase;

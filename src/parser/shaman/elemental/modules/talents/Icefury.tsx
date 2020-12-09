import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Events from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class Icefury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  empoweredFrostShockCasts = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ICEFURY_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FROST_SHOCK), this.onFrostShockCast);
  }

  get suggestionThresholds() {
    return {
      actual: this.empoweredFrostShockCasts / this.abilityTracker.getAbility(SPELLS.ICEFURY_TALENT.id).casts,
      isLessThan: {
        minor: 4,
        average: 3.5,
        major: 3,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  onFrostShockCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.ICEFURY_TALENT.id)) {
      this.empoweredFrostShockCasts += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) => suggest(<>You should fully utilize your <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> casts by casting 4 <SpellLink id={SPELLS.FROST_SHOCK.id} />s before the <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> buff expires. Pay attention to the remaining duration of the buff to ensure you have time to use all of the stacks.</>)
      .icon(SPELLS.ICEFURY_TALENT.icon)
      .actual(<>On average, only {actual.toFixed(2)} <SpellLink id={SPELLS.ICEFURY_TALENT.id} />(s) stacks were consumed with <SpellLink id={SPELLS.FROST_SHOCK.id} /> casts before <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> buff expired.</>)
      .recommended('It\'s recommended to always consume all 4 stacks.'));
  }
}

export default Icefury;

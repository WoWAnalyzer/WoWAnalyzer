import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';

import SpellUsable from '../../../shared/SpellUsable';

class BetweenTheEyes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id) || this.selectedCombatant.hasTrait(SPELLS.ACE_UP_YOUR_SLEEVE.id) || this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id);
  }

  delayedCasts = 0;
  
  get suggestionThresholds() {
    return {
      actual: this.delayedCasts,
      isGreaterThan: {
        minor: 0,
        average: 4,
        major: 9,
      },
      style: 'number',
    };
  }

  get hasRelevantTrait(){
    return this.selectedCombatant.hasTrait(SPELLS.ACE_UP_YOUR_SLEEVE.id) || this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id);
  }

  on_byPlayer_cast(event){
    if(event.ability.guid !== SPELLS.DISPATCH.id || this.spellUsable.isOnCooldown(SPELLS.BETWEEN_THE_EYES.id)){
      return;
    }

    if(this.hasRelevantTrait || this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id)){
      this.delayedCasts += 1;
    }
  }

  get extraSuggestion(){
    if(this.hasRelevantTrait){
      return <>Because you have the <SpellLink id={SPELLS.ACE_UP_YOUR_SLEEVE.id} /> or <SpellLink id={SPELLS.DEADSHOT.id} /> traits, you should always prioritize <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging spender (Keeping <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> up always takes priority). </>;
    }
    else{
      return <>Whenever you have the <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> buff, you should prioritize <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging spender.</>;
    }
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You casted <SpellLink id={SPELLS.DISPATCH.id} /> while <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> was available. {this.extraSuggestion}</>)
        .icon(SPELLS.BETWEEN_THE_EYES.icon)
        .actual(`${actual} delayed casts`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default BetweenTheEyes;
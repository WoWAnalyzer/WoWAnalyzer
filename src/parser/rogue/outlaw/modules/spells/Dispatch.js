import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import DamageTracker from 'parser/shared/modules/AbilityTracker';

import BetweenTheEyesDamageTracker from './BetweenTheEyesDamageTracker';

class Dispatch extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    betweenTheEyesDamageTracker: BetweenTheEyesDamageTracker,
  };

  constructor(...args) {
    super(...args);
    const hasRelevantTrait = this.selectedCombatant.hasTrait(SPELLS.ACE_UP_YOUR_SLEEVE.id) || this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id) || hasRelevantTrait;

    this.betweenTheEyesDamageTracker.subscribeInefficientCast(
      [SPELLS.DISPATCH],
      (s) => hasRelevantTrait ? `Between The Eyes should be prioritized as your spender when available` : `Between The Eyes should be prioritized as your spender during Ruthless Precision`
    );
  }
  
  get thresholds() {
    const total = this.damageTracker.getAbility(SPELLS.DISPATCH.id);
    const filtered = this.betweenTheEyesDamageTracker.getAbility(SPELLS.DISPATCH.id);

    return {
      actual: filtered.casts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: 'number',
    };
  }

  get delayedCastSuggestion(){
    if(this.selectedCombatant.hasTrait(SPELLS.ACE_UP_YOUR_SLEEVE.id) || this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id)){
      return <>Because you have the <SpellLink id={SPELLS.ACE_UP_YOUR_SLEEVE.id} /> or <SpellLink id={SPELLS.DEADSHOT.id} /> traits, you should always prioritize <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging spender (Keeping <SpellLink id={SPELLS.ROLL_THE_BONES.id} /> up always takes priority). </>;
    } else{
      return <>Whenever you have the <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> buff, you should prioritize <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging spender.</>;
    }
  }

  suggestions(when) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You casted <SpellLink id={SPELLS.DISPATCH.id} /> while <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> was available. {this.delayedCastSuggestion}</>)
        .icon(SPELLS.DISPATCH.icon)
        .actual(`${formatPercentage(actual)}% inefficient casts`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default Dispatch;
import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import {formatPercentage} from 'common/format';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import T20_2set from '../Items/T20_2set';

const CALL_DREADSTALKERS_CD = 15;


class CallDreadstalkers extends Analyzer{
  static dependencies = {
    abilityTracker: AbilityTracker,
    t20_2set: T20_2set,
    combatants: Combatants,
  };

  on_initialized(){
    this.has_2set = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T20_2P_BONUS);
  }

  get suggestionThresholds(){
    const t20Casts = (this.has_2set) ? this.t20_2set.procs : 0;
    const maxCasts = Math.ceil(calculateMaxCasts(CALL_DREADSTALKERS_CD, this.owner.fightDuration)) + t20Casts;
    const actualCasts = this.abilityTracker.getAbility(SPELLS.CALL_DREADSTALKERS.id).casts || 0;
    const percentage = actualCasts/maxCasts;

    return{
      actual: percentage,
      isLessThan: {
        minor: 0.95,
        average: 0.93,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>You should cast <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} icon/> more often. This is a crucial part of your rotation</React.Fragment>)
          .icon(SPELLS.CALL_DREADSTALKERS.icon)
          .actual(`You kept it on cooldown ${formatPercentage(actual)}% of the time.`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }
}

export default CallDreadstalkers;

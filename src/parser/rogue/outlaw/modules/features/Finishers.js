import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';

import ComboPointTracker from '../../../shared/resources/ComboPointTracker';

class Finishers extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    comboPointTracker: ComboPointTracker,
  };

  inefficientFinishers = [];

  get maximumComboPoints(){
    return this.comboPointTracker.maxResource;
  }

  get recommendedFinisherPoints(){
    let points = this.maximumComboPoints;

    if(this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id)){
      points -= 1;
    }
    else if(this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id) && this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)){
      points -= 1;
    }

    return points;
  }

  get finisherInefficiency(){
    const dispatchCasts = this.getCasts(SPELLS.DISPATCH.id);
    const rolltheBonesCasts = this.getCasts(SPELLS.ROLL_THE_BONES.id);
    const betweentheEyesCasts = this.getCasts(SPELLS.BETWEEN_THE_EYES.id);

    return this.inefficientFinishers.length / (dispatchCasts + rolltheBonesCasts + betweentheEyesCasts);
  }

  get suggestionThresholds() {
    return {
      actual: this.finisherInefficiency,
      isGreaterThan: {
        minor: 0.0,
        average: .05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  getCasts(spellId){
    const ability = this.abilityTracker.getAbility(spellId);

    if(ability){
      return ability.casts;
    }

    return 0;
  }

  on_byPlayer_cast(event){
    if(!event || !event.classResources){
      return;
    }

    const cpResource = getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id);
    if(!cpResource){
      return;
    }

    if(cpResource.cost < this.recommendedFinisherPoints){
      this.inefficientFinishers.push(event);
    }
  }

  get quickDrawSuggestionText(){
    if(this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id)){
      return <>, or you have an <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc,</>;
    }
    return '';
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Try to use your finishers at {this.maximumComboPoints} combo points. However if you have <SpellLink id={SPELLS.BROADSIDE.id} /> active{this.quickDrawSuggestionText} use your finisher at {this.maximumComboPoints-1} combo points instead.</>)
        .icon(SPELLS.DISPATCH.icon)
        .actual(`${formatPercentage(actual)}% inefficient casts`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default Finishers;
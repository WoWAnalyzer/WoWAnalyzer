import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Abilities from 'Parser/Core/Modules/Abilities';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import ShieldOfTheRighteous from '../ShieldOfTheRighteous';
import Consecration from '../Consecration';

import Component from './Component';



class Checklist extends Analyzer{
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    abilities: Abilities,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
  };

  render(){
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          consecration: this.consecration.uptimeSuggestionThresholds,
          shieldOfTheRighteous: this.shieldOfTheRighteous.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

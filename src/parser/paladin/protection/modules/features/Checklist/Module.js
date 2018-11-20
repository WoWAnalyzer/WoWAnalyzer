import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import ShieldOfTheRighteous from '../ShieldOfTheRighteous';
import Consecration from '../../spells/Consecration';
import LightOfTheProtector from '../../spells/LightOfTheProtector';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    abilities: Abilities,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
    lotp: LightOfTheProtector,
  };

  render(){
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        extras={{
          lotpAbility: this.lotp._activeSpell,
        }}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          consecration: this.consecration.uptimeSuggestionThresholds,
          shieldOfTheRighteous: this.shieldOfTheRighteous.suggestionThresholds,
          lotpDelay: this.lotp.delaySuggestion,
          lotpOverheal: this.lotp.overhealSuggestion,
        }}
      />
    );
  }
}

export default Checklist;

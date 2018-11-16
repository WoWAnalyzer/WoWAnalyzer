import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import DeepWoundsUptime from '../../core/Dots/DeepWoundsUptime';
import RendUptime from '../../core/Dots/RendUptime';
import MortalStrike from '../../core/Execute/MortalStrike';
import ExecutionersPrecision from '../../spells/azeritetraits/ExecutionersPrecision';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    deepWoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
    mortalStrike: MortalStrike,
    executionersPrecision: ExecutionersPrecision,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          deepWounds: this.deepWoundsUptime.suggestionThresholds,
          rend: this.rendUptime.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          goodMortalStrike: this.mortalStrike.goodMortalStrikeThresholds,
          badMortalStrike: this.mortalStrike.badMortalStrikeThresholds,
          badMortalStrikeWithEP: this.executionersPrecision.badMortalStrikeCastThresholds,
        }}
      />
    );
  }
}

export default Checklist;

import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';
import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import TimeFocusCapped from '../../../shared/modules/features/TimeFocusCapped';
import BarbedShot from '../../modules/spells/BarbedShot';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    timeFocusCapped: TimeFocusCapped,
    barbedShot: BarbedShot,
  };
  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          focusCappedSuggestionThresholds: this.timeFocusCapped.suggestionThresholds,
          frenzy3StackSuggestionThreshold: this.barbedShot.frenzy3StackThreshold,
          frenzyUptimeSuggestionThreshold: this.barbedShot.frenzyUptimeThreshold,
        }}
      />
    );
  }
}

export default Checklist;

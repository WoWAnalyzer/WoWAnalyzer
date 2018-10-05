import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';
import ShadowWordPain from 'parser/priest/shadow/modules/spells/ShadowWordPain';
import VampiricTouch from 'parser/priest/shadow/modules/spells/VampiricTouch';
import Voidform from 'parser/priest/shadow/modules/spells/Voidform';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    voidform: Voidform,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}

        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          shadowWordPain: this.shadowWordPain.suggestionThresholds,
          vampiricTouch: this.vampiricTouch.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
          voidform: this.voidform,

        }}
      />
    );
  }
}

export default Checklist;

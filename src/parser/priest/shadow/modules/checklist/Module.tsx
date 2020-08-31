import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';
import Voidform from '../spells/Voidform';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    voidform: Voidform,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected shadowWordPain!: ShadowWordPain;
  protected vampiricTouch!: VampiricTouch;
  protected voidform!: Voidform;

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

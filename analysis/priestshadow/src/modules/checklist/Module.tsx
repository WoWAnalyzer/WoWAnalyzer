import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';
import InsanityUsage from '../resources/InsanityUsage';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    insanityUsage: InsanityUsage,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected insanityUsage!: InsanityUsage;
  protected shadowWordPain!: ShadowWordPain;
  protected vampiricTouch!: VampiricTouch;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}

        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          insanityUsage: this.insanityUsage.suggestionThresholds,
          shadowWordPain: this.shadowWordPain.suggestionThresholds,
          vampiricTouch: this.vampiricTouch.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,

        }}
      />
    );
  }
}

export default Checklist;

import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

//Core
import ComboPoints from '../../core/ComboPoints';
import Energy from '../../core/Energy';
import AlwaysBeCasting from '../AlwaysBeCasting';

//Base
import CastsInShadowDance from '../../core/CastsInShadowDance';
import CastsInStealth from '../../core/CastsInStealth';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    //Core
    comboPoints: ComboPoints,
    energy: Energy,

    //Base
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          //Core
          comboPoints: this.comboPoints.comboPointThresholds,
          energy: this.energy.energyThresholds,

          //Base
          castsInShadowDance: this.castsInShadowDance.castsInStealthThresholds,
          backstabInShadowDance: this.castsInShadowDance.danceBackstabThresholds,
          castsInStealth: this.castsInStealth.castsInStealthThresholds,
          backstabInStealth: this.castsInStealth.stealthBackstabThresholds,
        }}
      />
    );
  }
}

export default Checklist;

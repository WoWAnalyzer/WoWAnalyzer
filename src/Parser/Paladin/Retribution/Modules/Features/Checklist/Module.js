import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import HolyPowerDetails from '../../HolyPower/HolyPowerDetails';
import ArtOfWar from '../../PaladinCore/ArtOfWar';
import Judgment from '../../PaladinCore/Judgment';
import Crusade from '../../Talents/Crusade';
import Inquisition from '../../Talents/Inquisition';
import RighteousVerdict from '../../Talents/RighteousVerdict';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    alwaysBeCasting: AlwaysBeCasting,
    holyPowerDetails: HolyPowerDetails,
    artOfWar: ArtOfWar,
    judgment: Judgment,
    crusade: Crusade,
    inquisition: Inquisition,
    righteousVerdict: RighteousVerdict,
  };
  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          alwaysBeCasting: this.alwaysBeCasting.suggestionThresholds,
          holyPowerDetails: this.holyPowerDetails.suggestionThresholds,
          artOfWar: this.artOfWar.suggestionThresholds,
          judgment: this.judgment.suggestionThresholds,
          crusade: this.crusade.suggestionThresholds,
          inquisition: this.inquisition.suggestionThresholds,
          righteousVerdict: this.righteousVerdict.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

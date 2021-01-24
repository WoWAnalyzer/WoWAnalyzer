import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import Judgment from 'parser/paladin/shared/spells/Judgment';

import AlwaysBeCasting from '../AlwaysBeCasting';
import HolyPowerDetails from '../../../../shared/holypower/HolyPowerDetails';
import ArtOfWar from '../../core/ArtOfWar';
import Crusade from '../../talents/Crusade';
import RighteousVerdict from '../../talents/RighteousVerdict';
import ShieldOfVengeance from '../../core/ShieldOfVengeance';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    alwaysBeCasting: AlwaysBeCasting,
    holyPowerDetails: HolyPowerDetails,
    artOfWar: ArtOfWar,
    judgment: Judgment,
    crusade: Crusade,
    righteousVerdict: RighteousVerdict,
    shieldOfVengeance: ShieldOfVengeance,
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
          crusade: this.crusade.suggestionThresholds,
          judgment: this.judgment.suggestionThresholds,
          righteousVerdict: this.righteousVerdict.suggestionThresholds,
          shieldOfVengeance: this.shieldOfVengeance.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

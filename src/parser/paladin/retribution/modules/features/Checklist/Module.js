import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import HolyPowerDetails from '../../holypower/HolyPowerDetails';
import ArtOfWar from '../../core/ArtOfWar';
import Judgment from '../../core/Judgment';
import Crusade from '../../talents/Crusade';
import Inquisition from '../../talents/Inquisition';
import RighteousVerdict from '../../talents/RighteousVerdict';
import ShieldOfVengeance from '../../core/ShieldOfVengeance';
import RelentlessInquisitor from '../../core/azeritetraits/RelentlessInquisitor';

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
    inquisition: Inquisition,
    righteousVerdict: RighteousVerdict,
    shieldOfVengeance: ShieldOfVengeance,
    relentlessInquisitor: RelentlessInquisitor,
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
          shieldOfVengeance: this.shieldOfVengeance.suggestionThresholds,
          relentlessInquisitor: this.relentlessInquisitor.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

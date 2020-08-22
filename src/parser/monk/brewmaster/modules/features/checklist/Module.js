import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import PurifyingBrew from '../../spells/PurifyingBrew';
import BrewCDR from '../../core/BrewCDR';
import TigerPalm from '../../spells/TigerPalm';
import RushingJadeWind from '../../spells/RushingJadeWind';
import BlackoutCombo from '../../spells/BlackoutCombo';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    castEfficiency: CastEfficiency,

    pb: PurifyingBrew,
    brewcdr: BrewCDR,
    tp: TigerPalm,
    rjw: RushingJadeWind,
    boc: BlackoutCombo,
  };

  render() {
    return (
      <Component
        combatant={this.selectedCombatant}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          purifyHeavy: this.pb.purifyHeavySuggestion,
          purifyDelay: this.pb.purifyDelaySuggestion,
          purifyCasts: this.pb.purifyCastSuggestion,
          totalCDR: this.brewcdr.suggestionThreshold,
          bocTp: this.tp.bocEmpoweredThreshold,
          bocDpsWaste: this.boc.dpsWasteThreshold,
          rjw: this.rjw.uptimeThreshold,
       }}
     />
    );
  }
}

export default Checklist;

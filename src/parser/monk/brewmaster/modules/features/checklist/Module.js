import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import IronSkinBrew from '../../spells/IronSkinBrew';
import PurifyingBrew from '../../spells/PurifyingBrew';
import BrewCDR from '../../core/BrewCDR';
import BreathOfFire from '../../spells/BreathOfFire';
import TigerPalm from '../../spells/TigerPalm';
import RushingJadeWind from '../../spells/RushingJadeWind';
import BlackoutCombo from '../../spells/BlackoutCombo';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    castEfficiency: CastEfficiency,

    bof: BreathOfFire,
    isb: IronSkinBrew,
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

          isb: this.isb.uptimeSuggestionThreshold,
          purifyHeavy: this.pb.purifyHeavySuggestion,
          purifyDelay: this.pb.purifyDelaySuggestion,
          purifyCasts: this.brewcdr.purifySuggestionThreshold,
          totalCDR: this.brewcdr.suggestionThreshold,
          isbClipping: this.isb.clipSuggestionThreshold,
          bof: this.bof.suggestionThreshold,
          bocTp: this.tp.bocEmpoweredThreshold,
          bocDpsWaste: this.boc.dpsWasteThreshold,
          rjw: this.rjw.uptimeThreshold,
       }}
     />
    );
  }
}

export default Checklist;

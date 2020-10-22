import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import BlackoutCombo from '../../spells/BlackoutCombo';
import TigerPalm from '../../spells/TigerPalm';
import RushingJadeWind from '../../spells/RushingJadeWind';
import PurifyingBrew from '../../spells/PurifyingBrew';
import Shuffle from '../../spells/Shuffle';

import Component from './Component';
import CelestialBrew from '../../spells/CelestialBrew';

export default class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    prep: PreparationRuleAnalyzer,
    boc: BlackoutCombo,
    tp: TigerPalm,
    rjw: RushingJadeWind,
    pb: PurifyingBrew,
    shuffle: Shuffle,
    cb: CelestialBrew,
  };

  protected combatants!: Combatants;
  protected prep!: PreparationRuleAnalyzer;
  protected castEfficiency!: CastEfficiency;
  protected boc!: BlackoutCombo;
  protected tp!: TigerPalm;
  protected rjw!: RushingJadeWind;
  protected pb!: PurifyingBrew;
  protected shuffle!: Shuffle;
  protected cb!: CelestialBrew;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.prep.thresholds,
          bocDpsWaste: this.boc.dpsWasteThreshold,
          bocTp: this.tp.bocEmpoweredThreshold,
          rjw: this.rjw.uptimeThreshold,
          purifyDelay: this.pb.purifyDelaySuggestion,
          shuffleHits: this.shuffle.uptimeSuggestionThreshold,
          goodCBCasts: this.cb.goodCastSuggestion,
        }}
      />
    );
  }
}

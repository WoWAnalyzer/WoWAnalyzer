import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import BlackoutCombo from '../../spells/BlackoutCombo';
import TigerPalm from '../../spells/TigerPalm';
import RushingJadeWind from '../../spells/RushingJadeWind';

import Component from './Component';

export default class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    prep: PreparationRuleAnalyzer,
    boc: BlackoutCombo,
    tp: TigerPalm,
    rjw: RushingJadeWind,
  };

  protected combatants!: Combatants;
  protected prep!: PreparationRuleAnalyzer;
  protected castEfficiency!: CastEfficiency;
  protected boc!: BlackoutCombo;
  protected tp!: TigerPalm;
  protected rjw!: RushingJadeWind;

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
        }}
      />
    );
  }
}

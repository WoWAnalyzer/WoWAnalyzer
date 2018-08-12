import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

//Core
import ComboPoints from '../../RogueCore/ComboPoints';
import Energy from '../../RogueCore/Energy';
import AlwaysBeCasting from '../AlwaysBeCasting';

//Base
import CastsInShadowDance from '../../BaseRotation/CastsInShadowDance';
import CastsInStealth from '../../BaseRotation/CastsInStealth';
import NightbladeDuringSymbols from '../../BaseRotation/NightbladeDuringSymbols';
import NightbladeUptime from '../../BaseRotation/NightbladeUptime';

//Talents
import DarkShadowNightblade from '../../Talents/DarkShadow/DarkShadowNightblade';
import FindWeakness from '../../Talents/FindWeakness';


import Component from './Component';

class Checklist extends Analyzer {
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
    nightbladeUptime: NightbladeUptime,
    nightbladeDuringSymbols: NightbladeDuringSymbols,

    //Talents
    darkShadowNightblade: DarkShadowNightblade,
    findWeakness: FindWeakness,
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
          nightbladeUptime:  this.nightbladeUptime.thresholds,
          nightbladeDuringSymbols: this.nightbladeDuringSymbols.thresholds,
          
          //Talents
          darkShadowNightblade: this.darkShadowNightblade.thresholds,
          findWeaknessVanish: this.findWeakness.vanishThresholds,
        }}
      />
    );
  }
}

export default Checklist;

import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import ComboBreaker from '../../Spells/ComboBreaker';
import FistsofFury from '../../Spells/FistsofFury';
import SpinningCraneKick from '../../Spells/SpinningCraneKick';
import TouchOfKarma from '../../Spells/TouchOfKarma';
import ComboStrikes from '../../Spells/ComboStrikes';
import BlackoutKick from '../../Spells/BlackoutKick';

import HitCombo from '../../Talents/HitCombo';
import EnergizingElixir from '../../Talents/EnergizingElixir';
import ChiDetails from '../../Chi/ChiDetails';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    hitCombo: HitCombo,
    energizingElixir: EnergizingElixir,
    chiDetails: ChiDetails,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          comboBreaker: this.comboBreaker.suggestionThresholds,
          fistsofFury: this.fistsofFury.suggestionThresholds,
          spinningCraneKick: this.spinningCraneKick.suggestionThresholds,
          touchOfKarma: this.touchOfKarma.suggestionThresholds,
          comboStrikes: this.comboStrikes.suggestionThresholds,
          blackoutKick: this.blackoutKick.suggestionThresholds,

          hitcombo: this.hitCombo.suggestionThresholds,
          energizingElixir: this.energizingElixir.suggestionThresholds,
          chiDetails: this.chiDetails.suggestionThresholds,
       }}
     />
    );
  }
}

export default Checklist;

import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import ComboBreaker from '../../spells/ComboBreaker';
import FistsofFury from '../../spells/FistsofFury';
import SpinningCraneKick from '../../spells/SpinningCraneKick';
import TouchOfKarma from '../../spells/TouchOfKarma';
import ComboStrikes from '../../spells/ComboStrikes';
import BlackoutKick from '../../spells/BlackoutKick';

import HitCombo from '../../talents/HitCombo';
import EnergizingElixir from '../../talents/EnergizingElixir';
import ChiDetails from '../../chi/ChiDetails';

import Component from './Component';

class Checklist extends BaseChecklist {
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

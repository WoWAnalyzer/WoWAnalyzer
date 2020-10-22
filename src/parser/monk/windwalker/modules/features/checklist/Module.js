import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import ComboBreaker from '../../spells/ComboBreaker';
import FistsofFury from '../../spells/FistsofFury';
import TouchOfKarma from '../../spells/TouchOfKarma';
import ComboStrikes from '../../spells/ComboStrikes';
import BlackoutKick from '../../spells/BlackoutKick';

import HitCombo from '../../talents/HitCombo';
import ChiDetails from '../../resources/ChiDetails';

import LastEmperorsCapacitor from '../../items/LastEmperorsCapacitor';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    touchOfKarma: TouchOfKarma,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    hitCombo: HitCombo,
    chiDetails: ChiDetails,

    lastEmperorsCapacitor: LastEmperorsCapacitor,
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
          touchOfKarma: this.touchOfKarma.suggestionThresholds,
          comboStrikes: this.comboStrikes.suggestionThresholds,
          blackoutKick: this.blackoutKick.suggestionThresholds,

          hitCombo: this.hitCombo.suggestionThresholds,
          chiDetails: this.chiDetails.suggestionThresholds,

          lastEmperorsCapacitorAverageStacks: this.lastEmperorsCapacitor.averageStacksSuggestionThresholds,
          lastEmperorsCapacitorWastedStacks: this.lastEmperorsCapacitor.wastedStacksSuggestionsThresholds,
       }}
     />
    );
  }
}

export default Checklist;

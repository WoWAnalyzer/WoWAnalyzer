import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Icefury from 'parser/shaman/elemental/modules/talents/Icefury';
import CancelledCasts from 'parser/shaman/elemental/modules/features/CancelledCasts';
import AlwaysBeCasting from 'parser/shaman/elemental/modules/features/AlwaysBeCasting';
import FlameShock from 'parser/shaman/elemental/modules/core/FlameShock';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    icefury: Icefury,
    flameshock: FlameShock,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          cancelledCasts: this.cancelledCasts.cancelledCastSuggestionThresholds,
          downtime: this.alwaysBeCasting.downtimeSuggestionThresholds,
          icefuryEfficiency: this.icefury.suggestionThresholds,
          flameshockUptime: this.flameshock.uptimeThresholds,
        }}
      />
    );
  }
}

export default Checklist;

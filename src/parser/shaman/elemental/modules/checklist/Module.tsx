import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Icefury from 'parser/shaman/elemental/modules/talents/Icefury';
import Ascendance from 'parser/shaman/elemental/modules/talents/Ascendance';
import CancelledCasts from 'parser/shaman/elemental/modules/features/CancelledCasts';
import AlwaysBeCasting from 'parser/shaman/elemental/modules/features/AlwaysBeCasting';

import Component from 'parser/shaman/elemental/modules/checklist/Component';
import FlameShock from 'parser/shaman/shared/spells/FlameShock';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    icefury: Icefury,
    ascendance: Ascendance,
    flameshock: FlameShock,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected cancelledCasts!: CancelledCasts;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected icefury!: Icefury;
  protected ascendance!: Ascendance;
  protected flameshock!: FlameShock;

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
          ascendanceEfficiency: this.ascendance.suggestionThresholds,
          flameShockUptime: this.flameshock.uptimeThreshold,
          flameShockRefreshes: this.flameshock.refreshThreshold,
        }}
      />
    );
  }
}

export default Checklist;

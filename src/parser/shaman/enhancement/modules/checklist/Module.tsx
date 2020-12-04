import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import WindfuryTotem from '../core/WindfuryTotem';
// import Flametongue from '../core/Flametongue';
// import Hailstorm from '../talents/Hailstorm';
// import FlametongueRefresh from '../core/FlametongueRefresh';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    windfuryTotem: WindfuryTotem,
    // flametongue: Flametongue,
    // flametongueRefresh: FlametongueRefresh,
    // hailstorm: Hailstorm,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected windfuryTotem!: WindfuryTotem;
  // protected flametongue!: Flametongue;
  // protected flametongueRefresh!: FlametongueRefresh;
  //protected hailstorm!: Hailstorm;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          alwaysBeCasting: this.alwaysBeCasting.suggestionThresholds,
          windfuryTotemUptime: this.windfuryTotem.uptimeThreshold,
          // Buffs uptime and refreshes
          // flametongueUptime: this.flametongue.flametongueUptimeThreshold,
          // flametongueEarlyRefreshes: this.flametongueRefresh.flametongueEarlyRefreshThreshold,
        }}
      />
    );
  }
}

export default Checklist;

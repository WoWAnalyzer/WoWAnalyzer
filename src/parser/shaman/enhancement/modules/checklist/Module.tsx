import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Flametongue from '../core/Flametongue';
import Hailstorm from '../talents/Hailstorm';
import FuryOfAir from '../talents/FuryOfAir';
import LightningShield from '../talents/LightningShield';
import FlametongueRefresh from '../core/FlametongueRefresh';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    lightningShield: LightningShield,
    flametongue: Flametongue,
    flametongueRefresh: FlametongueRefresh,
    hailstorm: Hailstorm,
    furyOfAir: FuryOfAir,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected lightningShield!: LightningShield;
  protected flametongue!: Flametongue;
  protected flametongueRefresh!: FlametongueRefresh;
  protected hailstorm!: Hailstorm;
  protected furyOfAir!: FuryOfAir;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          alwaysBeCasting: this.alwaysBeCasting.suggestionThresholds,

          // Buffs uptime and refreshes
          lightningShieldUptime: this.lightningShield.lightningShieldUptimeThreshold,
          flametongueUptime: this.flametongue.flametongueUptimeThreshold,
          flametongueEarlyRefreshes: this.flametongueRefresh.flametongueEarlyRefreshThreshold,
          frostbrandUptime: this.hailstorm.frostbrandUptimeThresholds,
          furyOfAirUptime: this.furyOfAir.furyOfAirUptimeThresholds,
        }}
      />
    );
  }
}

export default Checklist;

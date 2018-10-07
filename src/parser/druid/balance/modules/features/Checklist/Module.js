import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

import CancelledCasts from '../CancelledCasts';
import AlwaysBeCasting from '../AlwaysBeCasting';
import MoonfireUptime from '../MoonfireUptime';
import SunfireUptime from '../SunfireUptime';
import StellarFlareUptime from '../../talents/StellarFlareUptime';
import LunarEmpowerment from '../LunarEmpowerment';
import SolarEmpowerment from '../SolarEmpowerment';
import EarlyDotRefreshes from '../EarlyDotRefreshes';
import EarlyDotRefreshesInstants from '../EarlyDotRefreshesInstants';

import AstralPowerDetails from '../../resourcetracker/AstralPowerDetails';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    astralPowerDetails: AstralPowerDetails,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtime: this.alwaysBeCasting.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          moonfireUptime: this.moonfireUptime.suggestionThresholds,
          sunfireUptime: this.sunfireUptime.suggestionThresholds,
          stellarFlareUptime: this.stellarFlareUptime.suggestionThresholds,
          moonfireRefresh: this.earlyDotRefreshesInstants.suggestionThresholdsMoonfireEfficiency,
          sunfireRefresh: this.earlyDotRefreshesInstants.suggestionThresholdsSunfireEfficiency,
          stellarFlareRefresh: this.earlyDotRefreshes.suggestionThresholdsStellarFlareEfficiency,
          astralPowerEfficiency: this.astralPowerDetails.suggestionThresholds,
          solarEmpowermentEfficiency: this.solarEmpowerment.suggestionThresholds,
          lunarEmpowermentEfficiency: this.lunarEmpowerment.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

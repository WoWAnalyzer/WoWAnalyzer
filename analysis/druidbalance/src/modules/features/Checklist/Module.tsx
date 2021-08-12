import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import { AdaptiveSwarmDamageDealer } from '@wowanalyzer/druid';

import FillerUsage from '../../features/FillerUsage';
import AstralPowerDetails from '../../resourcetracker/AstralPowerDetails';
import StellarFlareUptime from '../../talents/StellarFlareUptime';
import AlwaysBeCasting from '../AlwaysBeCasting';
import CancelledCasts from '../CancelledCasts';
import EarlyDotRefreshes from '../EarlyDotRefreshes';
import EarlyDotRefreshesInstants from '../EarlyDotRefreshesInstants';
import MoonfireUptime from '../MoonfireUptime';
import Starsurge from '../Starsurge';
import SunfireUptime from '../SunfireUptime';
import Component from './Component';

class Checklist extends BaseModule {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    fillerUsage: FillerUsage,
    starsurge: Starsurge,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,
    astralPowerDetails: AstralPowerDetails,
    adaptiveSwarm: AdaptiveSwarmDamageDealer,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected cancelledCasts!: CancelledCasts;
  protected moonfireUptime!: MoonfireUptime;
  protected sunfireUptime!: SunfireUptime;
  protected stellarFlareUptime!: StellarFlareUptime;
  protected fillerUsage!: FillerUsage;
  protected starsurge!: Starsurge;
  protected earlyDotRefreshes!: EarlyDotRefreshes;
  protected earlyDotRefreshesInstants!: EarlyDotRefreshesInstants;
  protected astralPowerDetails!: AstralPowerDetails;
  protected adaptiveSwarm!: AdaptiveSwarmDamageDealer;

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
          astralPowerEfficiencyEclipse: this.astralPowerDetails.suggestionThresholdsEclipse,
          adaptiveSwarmUptime: this.adaptiveSwarm.suggestionThresholds,
          fillerUsage: this.fillerUsage.goodCastSuggestionThresholds,
          starsurgeUsage: this.starsurge.goodCastSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

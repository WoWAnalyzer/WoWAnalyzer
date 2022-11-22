import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';

import FillerUsage from 'analysis/retail/druid/balance/modules/features/FillerUsage';
import StellarFlareUptime from 'analysis/retail/druid/balance/modules/spells/StellarFlareUptime';
import AlwaysBeCasting from 'analysis/retail/druid/balance/modules/features/AlwaysBeCasting';
import CancelledCasts from 'analysis/retail/druid/balance/modules/features/CancelledCasts';
import EarlyDotRefreshes from 'analysis/retail/druid/balance/modules/features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from 'analysis/retail/druid/balance/modules/features/EarlyDotRefreshesInstants';
import MoonfireUptime from 'analysis/retail/druid/balance/modules/spells/MoonfireUptime';
import Starsurge from 'analysis/retail/druid/balance/modules/spells/Starsurge';
import SunfireUptime from 'analysis/retail/druid/balance/modules/spells/SunfireUptime';
import Component from 'analysis/retail/druid/balance/modules/checklist/Component';
import AstralPowerDetails from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerDetails';

class Checklist extends BaseModule {
  static dependencies = {
    ...BaseModule.dependencies,
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
          fillerUsage: this.fillerUsage.goodCastSuggestionThresholds,
          starsurgeUsage: this.starsurge.goodCastSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

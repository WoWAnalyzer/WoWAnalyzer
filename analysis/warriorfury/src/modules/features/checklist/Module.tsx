import PreparationRuleAnalyzer from 'parser/shadowlands/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import RageDetails from '../../core/RageDetails';
import RageTracker from '../../core/RageTracker';
import MissedRampage from '../../spells/MissedRampage';
import WhirlWind from '../../spells/Whirlwind';
import Bladestorm from '../../talents/Bladestorm';
import DragonRoar from '../../talents/DragonRoar';
import SiegeBreaker from '../../talents/Siegebreaker';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    rageDetails: RageDetails,
    rageTracker: RageTracker,
    missedRampage: MissedRampage,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    siegeBreaker: SiegeBreaker,
    bladeStorm: Bladestorm,
    dragonRoar: DragonRoar,
    whirlWind: WhirlWind,
  };

  // Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;

  // Spells
  protected whirlWind!: WhirlWind;

  // Talents
  protected siegeBreaker!: SiegeBreaker;
  protected bladeStorm!: Bladestorm;
  protected dragonRoar!: DragonRoar;

  // Resources
  protected rageDetails!: RageDetails;
  protected missedRampage!: MissedRampage;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          rageDetails: this.rageDetails.suggestionThresholds,
          siegeBreaker: this.siegeBreaker.suggestionThresholds,
          bladeStorm: this.bladeStorm.suggestionThresholds,
          dragonRoar: this.dragonRoar.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          missedRampage: this.missedRampage.suggestionThresholds,
          whirlWind: this.whirlWind.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

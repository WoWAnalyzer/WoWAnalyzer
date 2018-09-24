import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import DoomUptime from '../DoomUptime';
import Felstorm from '../Felstorm';
import SoulShardDetails from '../../SoulShards/SoulShardDetails';
import SoulShardTracker from '../../SoulShards/SoulShardTracker';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    doomUptime: DoomUptime,
    felstorm: Felstorm,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
  };

  render() {
    return (
      <Component
        castEfficiency={this.castEfficiency}
        combatant={this.combatants.selected}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          doom: this.doomUptime.suggestionThresholds,
          felstorm: this.felstorm.suggestionThresholds,
          soulShards: this.soulShardDetails.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
        }}
        shardTracker={this.soulShardTracker}
      />
    );
  }
}

export default Checklist;

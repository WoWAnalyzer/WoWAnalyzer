import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import ScouringTitheUptime from '../../covenants/ScouringTithe';
import ShadowEmbrace from '../../features/ShadowEmbrace';
import SoulShardDetails from '../../soulshards/SoulShardDetails';
import SoulShardTracker from '../../soulshards/SoulShardTracker';
import Haunt from '../../talents/Haunt';
import SiphonLifeUptime from '../../talents/SiphonLifeUptime';
import AlwaysBeCasting from '../AlwaysBeCasting';
import AgonyUptime from '../DotUptimes/AgonyUptime';
import CorruptionUptime from '../DotUptimes/CorruptionUptime';
import UnstableAfflictionUptime from '../DotUptimes/UnstableAfflictionUptime';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    siphonLifeUptime: SiphonLifeUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    haunt: Haunt,
    shadowEmbrace: ShadowEmbrace,
    scouringTithe: ScouringTitheUptime,
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

          agony: this.agonyUptime.suggestionThresholds,
          corruption: this.corruptionUptime.suggestionThresholds,
          unstableAffliction: this.unstableAfflictionUptime.suggestionThresholds,
          siphonLife: this.siphonLifeUptime.suggestionThresholds,
          haunt: this.haunt.suggestionThresholds,
          scouringTithe: this.scouringTithe.suggestionThresholds,
          shadowEmbrace: this.shadowEmbrace.suggestionThresholds,
          soulShards: this.soulShardDetails.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
        }}
        shardTracker={this.soulShardTracker}
      />
    );
  }
}

export default Checklist;

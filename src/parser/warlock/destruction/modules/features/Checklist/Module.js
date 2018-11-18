import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import ImmolateUptime from '../ImmolateUptime';
import Backdraft from '../Backdraft';
import SoulShardDetails from '../../soulshards/SoulShardDetails';
import SoulShardTracker from '../../soulshards/SoulShardTracker';
import Eradication from '../../talents/Eradication';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    immolateUptime: ImmolateUptime,
    backdraft: Backdraft,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
    eradication: Eradication,
  };

  render() {
    return (
      <Component
        castEfficiency={this.castEfficiency}
        combatant={this.combatants.selected}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          immolate: this.immolateUptime.suggestionThresholds,
          wastedBackdraft: this.backdraft.suggestionThresholds,
          eradication: this.eradication.suggestionThresholds,
          soulShards: this.soulShardDetails.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
        }}
        shardTracker={this.soulShardTracker}
      />
    );
  }
}

export default Checklist;

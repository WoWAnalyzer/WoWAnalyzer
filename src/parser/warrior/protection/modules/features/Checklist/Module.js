import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';
import RageDetails from '../../core/RageDetails';
import RageTracker from '../../core/RageTracker';
import ShieldSlam from '../../spells/ShieldSlam';
import ShieldBlock from '../../spells/ShieldBlock';
import ShieldBlockMitigation from '../../spells/ShieldBlockMitigation';
import AngerCD from '../../talents/AngerCD';


class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,    
    rageDetails: RageDetails,
    rageTracker: RageTracker,
    shieldSlam: ShieldSlam,
    shieldBlock: ShieldBlock,
    shieldBlockMitigation: ShieldBlockMitigation,
    angerCD: AngerCD,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          rageDetails: this.rageDetails.suggestionThresholds,
          shieldSlam: this.shieldSlam.suggestionThresholds,
          demoShoutCD: this.angerCD.suggestionThresholdsDemoShout,
          avatarCD: this.angerCD.suggestionThresholdsAvatar,
          lastStandCD: this.angerCD.suggestionThresholdsLastStand,
          shieldWallCD: this.angerCD.suggestionThresholdsShieldWall,
          shieldBlock: this.shieldBlock.suggestionThresholds,
          shieldBlockMitigation: this.shieldBlockMitigation.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

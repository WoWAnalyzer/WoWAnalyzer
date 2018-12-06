import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

import BoneShield from './../BoneShield';
import BloodPlagueUptime from './../BloodPlagueUptime';
import CrimsonScourge from './../CrimsonScourge';
import MarrowrendUsage from './../MarrowrendUsage';
import DeathsCaress from '../../core/DeathsCaress';
import BoneStorm from '../../talents/Bonestorm';
import MarkOfBloodUptime from '../../talents/MarkOfBlood';
import Ossuary from '../../talents/Ossuary';
import RuneStrike from '../../talents/RuneStrike';
import Consumption from '../../talents/Consumption';
import RunicPowerDetails from '../../runicpower/RunicPowerDetails';
import RuneTracker from '../../../../shared/RuneTracker';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    bloodplagueUptime: BloodPlagueUptime,
    boneShield: BoneShield,
    ossuary: Ossuary,
    runeStrike: RuneStrike,
    deathsCaress: DeathsCaress,
    bonestorm: BoneStorm,
    consumption: Consumption,
    markOfBloodUptime: MarkOfBloodUptime,
    crimsonScourge: CrimsonScourge,
    marrowrendUsage: MarrowrendUsage,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          crimsonScourge: this.crimsonScourge.efficiencySuggestionThresholds,
          runicPower: this.runicPowerDetails.efficiencySuggestionThresholds,
          runes: this.runeTracker.suggestionThresholdsEfficiency,
          marrowrend: this.marrowrendUsage.suggestionThresholdsEfficiency,
          runestrike: this.runeStrike.cooldownReductionThresholds,
          deathsCaress: this.deathsCaress.averageCastSuggestionThresholds,
          consumption: this.consumption.hitSuggestionThreshold,
          bonestorm: this.bonestorm.suggestionThresholds,
          bloodPlague: this.bloodplagueUptime.uptimeSuggestionThresholds,
          markOfBlood: this.markOfBloodUptime.uptimeSuggestionThresholds,
          boneShield: this.boneShield.uptimeSuggestionThresholds,
          ossuary: this.ossuary.uptimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

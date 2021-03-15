import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import { RuneTracker } from '@wowanalyzer/deathknight';

import DeathsCaress from '../../core/DeathsCaress';
import RunicPowerDetails from '../../runicpower/RunicPowerDetails';
import BoneStorm from '../../talents/Bonestorm';
import Consumption from '../../talents/Consumption';
import MarkOfBloodUptime from '../../talents/MarkOfBlood';
import AlwaysBeCasting from '../AlwaysBeCasting';
import BloodPlagueUptime from '../BloodPlagueUptime';
import BoneShield from '../BoneShield';
import CrimsonScourge from '../CrimsonScourge';
import MarrowrendUsage from '../MarrowrendUsage';
import Ossuary from '../Ossuary';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    bloodplagueUptime: BloodPlagueUptime,
    boneShield: BoneShield,
    ossuary: Ossuary,
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
          deathsCaress: this.deathsCaress.averageCastSuggestionThresholds,
          consumption: this.consumption.hitSuggestionThreshold,
          bonestorm: this.bonestorm.suggestionThresholds,
          bloodPlague: this.bloodplagueUptime.uptimeSuggestionThresholds,
          markOfBlood: this.markOfBloodUptime.uptimeSuggestionThresholds,
          boneShield: this.boneShield.uptimeSuggestionThresholds,
          ossuary: this.ossuary.efficiencySuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

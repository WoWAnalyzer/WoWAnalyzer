import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import VelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import TidalWaves from '../TidalWaves';
import ChainHeal from '../../Spells/ChainHeal';
import HealingRain from '../../Spells/HealingRain';
import HealingSurge from '../../Spells/HealingSurge';
import HealingWave from '../../Spells/HealingWave';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    velensFutureSight: VelensFutureSight,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    tidalWaves: TidalWaves,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
    healingSurge: HealingSurge,
    healingWave: HealingWave,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          unusedTidalWavesThresholds: this.tidalWaves.suggestionThresholds,
          unbuffedHealingSurgesThresholds: this.healingSurge.suggestedThreshold,
          unbuffedHealingWavesThresholds: this.healingWave.suggestedThreshold,
          chainHealTargetThresholds: this.chainHeal.suggestionThreshold,
          healingRainTargetThreshold: this.healingRain.suggestionThreshold,
          manaLeft: this.manaValues.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

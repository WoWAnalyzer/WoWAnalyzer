import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import React from 'react';

import ChainHeal from '../../spells/ChainHeal';
import EarthShield from '../../spells/EarthShield';
import HealingRain from '../../spells/HealingRain';
import EarthenWallTotem from '../../talents/EarthenWallTotem';
import SurgeOfEarth from '../../talents/SurgeOfEarth';
import Wellspring from '../../talents/Wellspring';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
    earthShield: EarthShield,
    wellspring: Wellspring,
    earthenWallTotem: EarthenWallTotem,
    surgeOfEarth: SurgeOfEarth,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected chainHeal!: ChainHeal;
  protected healingRain!: HealingRain;
  protected earthShield!: EarthShield;
  protected wellspring!: Wellspring;
  protected earthenWallTotem!: EarthenWallTotem;
  protected surgeOfEarth!: SurgeOfEarth;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting
            .nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          chainHealTargetThresholds: this.chainHeal.suggestionThreshold,
          healingRainTargetThreshold: this.healingRain.suggestionThreshold,
          wellspringTargetThreshold: this.wellspring.suggestionThreshold,
          ewtTargetThreshold: this.earthenWallTotem.suggestionThreshold,
          soeTargetThreshold: this.surgeOfEarth.suggestionThreshold,
          manaLeft: this.manaValues.suggestionThresholds,
          earthShieldPrepull: this.earthShield.suggestionThresholdsPrepull,
          earthShieldUptime: this.earthShield.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

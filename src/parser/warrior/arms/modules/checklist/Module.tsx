import React from 'react';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import DeepWoundsUptime from '../core/Dots/DeepWoundsUptime';
import RendUptime from '../core/Dots/RendUptime';
import MortalStrike from '../core/Execute/MortalStrike';
import SweepingStrikes from '../core/SweepingStrikes';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    deepWoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
    mortalStrike: MortalStrike,
    sweepingStrikes: SweepingStrikes,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected deepWoundsUptime!: DeepWoundsUptime;
  protected rendUptime!: RendUptime;
  protected mortalStrike!: MortalStrike;
  protected sweepingStrikes!: SweepingStrikes;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          deepWounds: this.deepWoundsUptime.suggestionThresholds,
          rend: this.rendUptime.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          goodMortalStrike: this.mortalStrike.goodMortalStrikeThresholds,
          notEnoughMortalStrike: this.mortalStrike.notEnoughMortalStrikeThresholds,
          tooMuchMortalStrike: this.mortalStrike.tooMuchMortalStrikeThresholds,
          badSweepingStrikes: this.sweepingStrikes.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

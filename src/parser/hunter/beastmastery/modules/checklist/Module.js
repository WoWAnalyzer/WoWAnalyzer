import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import BestialWrath from '../spells/BestialWrath';
import KillerCobra from '../talents/KillerCobra';
import CobraShot from '../spells/CobraShot';
import BarbedShot from '../spells/BarbedShot';
import FocusDetails from '../../../shared/modules/resources/FocusDetails';
import BeastMasteryFocusCapTracker from '../core/BeastMasteryFocusCapTracker';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    barbedShot: BarbedShot,
    bestialWrath: BestialWrath,
    killerCobra: KillerCobra,
    cobraShot: CobraShot,
    focusGeneratorDetails: FocusDetails,
    focusCapTracker: BeastMasteryFocusCapTracker,
  };
  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.suggestionThresholds,
          frenzy3StackSuggestionThreshold: this.barbedShot.frenzy3StackThreshold,
          frenzyUptimeSuggestionThreshold: this.barbedShot.frenzyUptimeThreshold,
          bestialWrathCDREfficiencyThreshold: this.bestialWrath.cdrEfficiencyBestialWrathThreshold,
          bestialWrathFocusThreshold: this.bestialWrath.focusOnBestialWrathCastThreshold,
          wastedKillerCobraThreshold: this.killerCobra.wastedKillerCobraThreshold,
          cobraShotCDREfficiencyThreshold: this.cobraShot.cdrEfficiencyCobraShotThreshold,
          wastedCobraShotsThreshold: this.cobraShot.wastedCobraShotsThreshold,
          focusGeneratorWasteThresholds: this.focusGeneratorDetails.focusGeneratorWasteThresholds,
          focusNaturalRegenWasteThresholds: this.focusCapTracker.focusNaturalRegenWasteThresholds,
        }}
      />
    );
  }
}

export default Checklist;

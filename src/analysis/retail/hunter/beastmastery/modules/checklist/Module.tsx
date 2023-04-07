import { FocusDetails } from 'analysis/retail/hunter/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import BasicAttacks from '../pets/BasicAttacksTracker';
import BeastMasteryFocusCapTracker from '../resources/BeastMasteryFocusCapTracker';
import BarbedShot from '../talents/BarbedShot';
import BeastCleave from '../talents/BeastCleave';
import BestialWrath from '../talents/BestialWrath';
import CobraShot from '../talents/CobraShot';
import KillerCobra from '../talents/KillerCobra';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
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
    beastCleave: BeastCleave,
    basicAttacks: BasicAttacks,
  };

  //region Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  //endregion

  //region Spells
  protected beastCleave!: BeastCleave;
  protected cobraShot!: CobraShot;
  protected barbedShot!: BarbedShot;
  protected bestialWrath!: BestialWrath;
  //endregion

  //region Talents
  protected killerCobra!: KillerCobra;
  //endregion

  //region Resources
  protected focusGeneratorDetails!: FocusDetails;
  protected focusCapTracker!: BeastMasteryFocusCapTracker;
  //endregion

  //region Pets
  protected basicAttacks!: BasicAttacks;

  //endregion

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          //region Core
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.suggestionThresholds,
          //endregion

          //region Spells
          frenzy3StackSuggestionThreshold: this.barbedShot.frenzy3StackThreshold,
          frenzyUptimeSuggestionThreshold: this.barbedShot.frenzyUptimeThreshold,
          bestialWrathCDREfficiencyThreshold: this.bestialWrath.cdrEfficiencyBestialWrathThreshold,
          bestialWrathFocusThreshold: this.bestialWrath.focusOnBestialWrathCastThreshold,
          cobraShotCDREfficiencyThreshold: this.cobraShot.cdrEfficiencyCobraShotThreshold,
          wastedCobraShotsThreshold: this.cobraShot.wastedCobraShotsThreshold,
          beastCleaveThresholds: this.beastCleave.beastCleavesWithoutHits,
          //endregion

          //region Talents
          wastedKillerCobraThreshold: this.killerCobra.wastedKillerCobraThreshold,
          //endregion

          //region Resources
          focusGeneratorWasteThresholds: this.focusGeneratorDetails.focusGeneratorWasteThresholds,
          focusNaturalRegenWasteThresholds: this.focusCapTracker.focusNaturalRegenWasteThresholds,
          //endregion

          //region Pets
          basicAttackThresholds: this.basicAttacks.additionalAttacksFromMacroing,
          //endregion
        }}
      />
    );
  }
}

export default Checklist;

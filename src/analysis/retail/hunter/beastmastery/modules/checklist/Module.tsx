import { FocusDetails } from 'analysis/retail/hunter/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import { apl, check as aplCheck } from '../apl/AplCheck';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import QaplaEredunWarOrder from '../items/QaplaEredunWarOrder';
import BasicAttacks from '../pets/basicAttacksTracker';
import BeastMasteryFocusCapTracker from '../resources/BeastMasteryFocusCapTracker';
import BarbedShot from '../spells/BarbedShot';
import BeastCleave from '../spells/BeastCleave';
import BestialWrath from '../spells/BestialWrath';
import CobraShot from '../spells/CobraShot';
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
    qaplaEredunWarOrder: QaplaEredunWarOrder,
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

  //region Legendaries (and sets.. maybe, please blizzard)
  protected qaplaEredunWarOrder!: QaplaEredunWarOrder;
  //endregion

  //region Resources
  protected focusGeneratorDetails!: FocusDetails;
  protected focusCapTracker!: BeastMasteryFocusCapTracker;
  //endregion

  //region Pets
  protected basicAttacks!: BasicAttacks;

  //endregion

  render() {
    const checkResults = aplCheck(this.owner.eventHistory, this.owner.info);
    return (
      <Component
        apl={apl}
        checkResults={checkResults}
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

          //region Legendaries
          qaplaEfficiencyThreshold: this.qaplaEredunWarOrder.killCommandResetsThreshold,
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

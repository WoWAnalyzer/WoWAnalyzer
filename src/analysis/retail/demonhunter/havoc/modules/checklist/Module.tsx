import { Felblade } from 'analysis/retail/demonhunter/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import FuryDetails from '../resourcetracker/FuryDetails';
import DemonBite from '../spells/DemonBite';
import BlindFury from '../talents/BlindFury';
import DemonBlades from '../talents/DemonBlades';
import DemonicDeathSweep from '../talents/DemonicDeathSweep';
import DemonicAppetite from '../talents/DemonicAppetite';
import FelBarrage from '../talents/FelBarrage';
import FelEruption from '../talents/FelEruption';
import Momentum from '../talents/Momentum';
import Component from './Component';
import BurningHatred from 'analysis/retail/demonhunter/havoc/modules/talents/BurningHatred';

class Checklist extends BaseModule {
  static dependencies = {
    ...BaseModule.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Short CDs
    felblade: Felblade,
    burningHatred: BurningHatred,

    // Don't waste casts
    blindFury: BlindFury,
    demonicDeathSweep: DemonicDeathSweep,
    felBarrage: FelBarrage,
    felEruption: FelEruption,

    // Maintain buffs/debuffs
    momentum: Momentum,

    // Manage your fury properly
    demonBite: DemonBite,
    demonicAppetite: DemonicAppetite,
    demonBlades: DemonBlades,
    furyDetails: FuryDetails,
  };

  //region Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  //endregion

  //region Short CDs
  protected felblade!: Felblade;
  protected burningHatred!: BurningHatred;
  //endregion

  //region Talents
  protected blindFury!: BlindFury;
  protected demonicDeathSweep!: DemonicDeathSweep;
  protected felBarrage!: FelBarrage;
  protected felEruption!: FelEruption;
  //endregion

  //region BuffsDebuffs
  protected momentum!: Momentum;
  //endregion

  //region Resources
  protected demonBite!: DemonBite;
  protected demonicAppetite!: DemonicAppetite;
  protected demonBlades!: DemonBlades;
  protected furyDetails!: FuryDetails;
  //endregion

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,

          // Short CDs
          felbladeEfficiency: this.felblade.suggestionThresholds,
          immolationAuraEfficiency: this.burningHatred.suggestionThresholds,

          // Don't waste casts
          blindFuryBadCasts: this.blindFury.suggestionThresholds,
          demonicBadCasts: this.demonicDeathSweep.suggestionThresholds,
          felBarrageBadCasts: this.felBarrage.suggestionThresholds,
          felEruptionBadCasts: this.felEruption.suggestionThresholds,

          // Maintain buffs/debuffs
          momentumBuffUptime: this.momentum.suggestionThresholds,

          // Use your offensive cool downs

          // Manage your fury properly
          demonBiteFury: this.demonBite.suggestionThresholds,
          demonicAppetiteEfficiency: this.demonicAppetite.suggestionThresholds,
          demonBladesEfficiency: this.demonBlades.suggestionThresholds,
          totalFuryWasted: this.furyDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

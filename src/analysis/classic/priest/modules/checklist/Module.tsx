import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import PrayerOfMending from '../spells/PrayerOfMending';
import Component from './Component';
import ShadowWordPain from 'analysis/classic/priest/modules/spells/ShadowWordPain';
import VampiricTouch from 'analysis/classic/priest/modules/spells/VampiricTouch';
import DevouringPlague from 'analysis/classic/priest/modules/spells/DevouringPlague';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    alwaysBeCasting: AlwaysBeCasting,
    prayerOfMending: PrayerOfMending,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    combatPotionChecker: CombatPotionChecker,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    devouringPlague: DevouringPlague,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected prayerOfMending!: PrayerOfMending;
  protected manaValues!: ManaValues;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected combatPotionChecker!: CombatPotionChecker;
  protected shadowWordPain!: ShadowWordPain;
  protected vampiricTouch!: VampiricTouch;
  protected devouringPlague!: DevouringPlague;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          prayerOfMending: this.prayerOfMending.prayerOfMendingThreshold,
          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          shadowWordPain: this.shadowWordPain.uptimeSuggestionThresholds,
          vampiricTouch: this.vampiricTouch.suggestionThresholds,
          devouringPlague: this.devouringPlague.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

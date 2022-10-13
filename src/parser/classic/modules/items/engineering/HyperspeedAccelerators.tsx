import Analyzer, { Options } from 'parser/core/Analyzer';

import { ThresholdStyle } from 'parser/core/ParseResults';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const HYPERSPEED_ACCELERATORS_ENCHANT_ID = 3604;
const HYPERSPEED_ACCELERATORS_SPELL_ID = 54758;
const HYPERSPEED_ACCELERATORS_SPELL_COOLDOWN = 60;

class HyperspeedAccelerators extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    const bracers = this.selectedCombatant._getGearItemBySlotId(9);
    this.active = bracers.permanentEnchant === HYPERSPEED_ACCELERATORS_ENCHANT_ID;
    (options.abilities as Abilities).add({
      spell: HYPERSPEED_ACCELERATORS_SPELL_ID,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: HYPERSPEED_ACCELERATORS_SPELL_COOLDOWN,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
  }

  get suggestionThresholds() {
    return {
      actual: 0,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default HyperspeedAccelerators;


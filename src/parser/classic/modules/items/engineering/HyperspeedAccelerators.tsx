import Analyzer, { Options } from 'parser/core/Analyzer';

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
    const gloves = this.selectedCombatant._getGearItemBySlotId(9);
    this.active = gloves.permanentEnchant === HYPERSPEED_ACCELERATORS_ENCHANT_ID;
    if (this.active) {
      (options.abilities as Abilities).add({
        spell: HYPERSPEED_ACCELERATORS_SPELL_ID,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: HYPERSPEED_ACCELERATORS_SPELL_COOLDOWN,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .3,
          averageIssueEfficiency: .1,
          majorIssueEfficiency: -1,
        },
      });
    }
  }
}

export default HyperspeedAccelerators;

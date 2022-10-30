import Analyzer, { Options } from 'parser/core/Analyzer';

import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const FRAG_BELT_ENCHANT_ID = 3601;
const FRAG_BELT_SPELL_ID = 67890;
const FRAG_BELT_SPELL_COOLDOWN = 360;

class FragBelt extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    const belt = this.selectedCombatant._getGearItemBySlotId(5);
    this.active = belt.permanentEnchant === FRAG_BELT_ENCHANT_ID;

    if (this.active) {
      (options.abilities as Abilities).add({
        spell: FRAG_BELT_SPELL_ID,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: FRAG_BELT_SPELL_COOLDOWN,
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

export default FragBelt;

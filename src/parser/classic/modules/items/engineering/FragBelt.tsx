import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic/engineering';

class FragBelt extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    const belt = this.selectedCombatant._getGearItemBySlotId(5);
    this.active = belt.permanentEnchant === 3601;

    if (this.active) {
      (options.abilities as Abilities).add({
        spell: SPELLS.FRAG_BELT.id,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: 360,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
          averageIssueEfficiency: 0.1,
          majorIssueEfficiency: -1,
        },
      });
    }
  }
}

export default FragBelt;

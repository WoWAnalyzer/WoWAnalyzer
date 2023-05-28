import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/classic/engineering';

class HyperspeedAccelerators extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    const gloves = this.selectedCombatant._getGearItemBySlotId(9);
    this.active = gloves.permanentEnchant === 3604;
    if (this.active) {
      (options.abilities as Abilities).add({
        spell: SPELLS.HYPERSPEED_ACCELERATION.id,
        category: SPELL_CATEGORY.ITEMS,
        cooldown: 60,
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

export default HyperspeedAccelerators;

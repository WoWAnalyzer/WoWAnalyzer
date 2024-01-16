import Analyzer, { Options } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS/dragonflight/others';
import SPELLS from 'common/SPELLS/dragonflight/others';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const deps = {
  abilities: Abilities,
};
export default class Fyralath extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasMainHand(ITEMS.FYRALATH.id);
    if (this.active) {
      this.deps.abilities.add({
        spell: SPELLS.RAGE_OF_FYRALATH_1.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        damageSpellIds: [SPELLS.RAGE_OF_FYRALATH_DAMAGE_1.id, SPELLS.RAGE_OF_FYRALATH_DAMAGE_2.id],
      });
    }
  }
}

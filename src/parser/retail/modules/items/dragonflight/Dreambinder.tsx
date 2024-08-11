import Analyzer, { Options } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS/dragonflight/others';
import SPELLS from 'common/SPELLS/dragonflight/others';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const deps = {
  abilities: Abilities,
};

export default class Dreambinder extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasMainHand(ITEMS.DREAMBINDER_LOOM_OF_THE_GREAT_CYCLE.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.DREAMBINDER_WEB_OF_DREAMS_DAMAGE.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
      damageSpellIds: [SPELLS.DREAMBINDER_WEB_OF_DREAMS_DAMAGE.id],
    });
  }
}

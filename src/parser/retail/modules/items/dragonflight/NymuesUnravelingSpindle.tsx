import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TRINKETS from 'common/ITEMS/dragonflight/trinkets';

const deps = {
  abilities: Abilities,
};

export default class NymuesUnravelingSpindle extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(TRINKETS.NYMUES_UNRAVELING_SPINDLE.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.NYMUES_UNRAVELING_SPINDLE.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
      damageSpellIds: [SPELLS.NYMUES_UNRAVELING_SPINDLE.id],
    });
  }
}

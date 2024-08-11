import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TRINKETS from 'common/ITEMS/dragonflight/trinkets';

const deps = {
  abilities: Abilities,
};

export default class BelorrelosTheSuncaller extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(TRINKETS.BELORRELOS_THE_SUNCALLER.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.BELORRELOS_SOLAR_MAELSTROM.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
      damageSpellIds: [SPELLS.BELORRELOS_SOLAR_MAELSTROM.id],
    });
  }
}

import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class MereldarsToll extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.MERELDARS_TOLL.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.MERELDARS_TOLL_USE.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: 90,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });
  }
}

import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class SignetOfThePriory extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.SIGNET_OF_THE_PRIORY.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.BOLSTERING_LIGHT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });
  }
}

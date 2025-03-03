import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class OvinaxMercurialEgg extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.OVINAXS_MERCURIAL_EGG.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.SUSPENDED_INCUBATION.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
    });
  }
}

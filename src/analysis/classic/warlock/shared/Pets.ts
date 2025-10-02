import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class Pets extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    // Pet spells missing from Generated spells list
    this.deps.abilities.add({
      category: SPELL_CATEGORY.OTHERS,
      spell: [SPELLS.SHADOW_BULWARK.id],
      name: SPELLS.SHADOW_BULWARK.name,
      gcd: {
        base: 1000,
      },
    });
  }
}

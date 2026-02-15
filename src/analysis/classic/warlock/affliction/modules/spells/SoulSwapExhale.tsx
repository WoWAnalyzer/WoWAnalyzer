import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class SoulSwapExhale extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.SOUL_SWAP_EXHALE.id],
      name: SPELLS.SOUL_SWAP_EXHALE.name,
      gcd: {
        base: 1500,
      },
    });
  }
}

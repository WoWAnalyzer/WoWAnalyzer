import SPELLS from 'common/SPELLS/classic';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class Jab extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    // unfortunately, this turns out to not just be DW vs 2H. it also depends on the item type...which is not in the log.
    this.deps.abilities.add({
      category: SPELL_CATEGORY.ROTATIONAL,
      spell: [SPELLS.JAB_2H.id, SPELLS.JAB_1H.id, SPELLS.JAB_1H_MACE.id],
      name: SPELLS.JAB_2H.name,
      gcd: {
        static: 1000,
      },
    });
  }
}

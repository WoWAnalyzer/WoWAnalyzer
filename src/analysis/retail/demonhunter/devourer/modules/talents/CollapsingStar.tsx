import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from '../../spell-list_DemonHunter_Devourer.retail';
import SPELLS_COMMON from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

// Collapsing Star is a spender for Devourer that is available during Void Meta after consuming (?)
// enough soul fragments. This *should* be an ExecuteHelper, but I'm not familiar enough with the spec
// to YOLO a proper ExecuteHelper implementation. This is a temporary solution to show the spell.
export default class CollapsingStar extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.COLLAPSING_STAR_TALENT);

    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS_COMMON.COLLAPSING_STAR.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: {
        base: 1500,
      },
    });
  }
}

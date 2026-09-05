import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

// Collapsing Star is a spender for Devourer that is available during Void Meta after consuming
// Soul Fragments. This should be treated as a conditional spender rather than a normal rotational
// ability, but in the current analyzer it is exposed as a spellbook item for visibility.
export default class CollapsingStar extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.COLLAPSING_STAR_TALENT);

    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.COLLAPSING_STAR.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: {
        base: 1500,
      },
    });
  }
}

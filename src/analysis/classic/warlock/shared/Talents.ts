import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';

export default class Talents extends Analyzer.withDependencies({ abilities: Abilities }) {
  constructor(options: Options) {
    super(options);
    const combatant = this.selectedCombatant;

    // Talent spells missing from Generated spells list
    if (combatant.hasClassicTalent(SPELLS.GRIMOIRE_OF_SACRIFICE.id)) {
      this.deps.abilities.add({
        category: SPELL_CATEGORY.OTHERS,
        spell: [SPELLS.GRIMOIRE_OF_SACRIFICE.id],
        name: SPELLS.GRIMOIRE_OF_SACRIFICE.name,
        gcd: null,
      });
    }
    if (combatant.hasClassicTalent(SPELLS.SHADOWFURY.id)) {
      this.deps.abilities.add({
        category: SPELL_CATEGORY.DEFENSIVE,
        spell: [SPELLS.SHADOWFURY.id],
        name: SPELLS.SHADOWFURY.name,
        gcd: { base: 500 },
        cooldown: 30,
      });
    }
  }
}

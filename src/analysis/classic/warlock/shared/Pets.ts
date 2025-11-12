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
      spell: [SPELLS.FELSTORM.id],
      name: SPELLS.FELSTORM.name,
      gcd: null, // base GCD is listed as 1000 for the pet
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.OTHERS,
      spell: [SPELLS.OPTICAL_BLAST.id],
      name: SPELLS.OPTICAL_BLAST.name,
      gcd: null, // base GCD is listed as 1000 for the pet
    });
    this.deps.abilities.add({
      category: SPELL_CATEGORY.OTHERS,
      spell: [SPELLS.SHADOW_BULWARK.id],
      name: SPELLS.SHADOW_BULWARK.name,
      gcd: null, // base GCD is listed as 1000 for the pet
    });
  }
}

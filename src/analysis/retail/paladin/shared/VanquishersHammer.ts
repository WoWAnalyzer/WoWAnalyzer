import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

class VanquishersHammer extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = false;

    if (!this.active) {
      return;
    }

    // (options.abilities as Abilities).add({
    //   spell: SPELLS.VANQUISHERS_HAMMER.id,
    //   category: SPELL_CATEGORY.COOLDOWNS,
    //   cooldown: 30,
    //   charges: 1,
    //   gcd: {
    //     base: 1500,
    //   },
    //   castEfficiency: {
    //     suggestion: true,
    //     recommendedEfficiency: 0.8,
    //   },
    // });
  }
}

export default VanquishersHammer;

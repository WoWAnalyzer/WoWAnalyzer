import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class DivineToll extends Analyzer {
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

    (options.abilities as Abilities).add({
      spell: TALENTS.DIVINE_TOLL_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 60,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
  }
}

export default DivineToll;

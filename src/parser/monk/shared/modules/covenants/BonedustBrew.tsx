import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';

export default class BonedustBrew extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.BONEDUST_BREW_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 60,
      gcd: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });
  }
}

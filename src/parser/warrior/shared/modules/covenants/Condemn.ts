import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';

class FallenOrder extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.CONDEMN,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      gcd: {
        base: 1500,
      },
    });
  }
}

export default FallenOrder;

import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Abilities from 'parser/core/modules/Abilities';
import SPECS from 'game/SPECS';

const BASE_MASTERY_PERCENTAGE = 0.1;

class WeaponsOfOrder extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 120,
      // WoO is hasted for WW/BrM for whatever fucking reason
      gcd: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { base: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });
  }

  get masteryBuffPercentage() {
    return BASE_MASTERY_PERCENTAGE * this.selectedCombatant.spec.masteryCoefficient;
  }
}

export default WeaponsOfOrder;

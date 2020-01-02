import SPELLS from 'common/SPELLS/index';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

/**
 * Heals the target for 20% of the caster's total health over 5 sec.
 */
class GiftOfTheNaaru extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Draenei;
    if (!this.active) {
      return;
    }

    options.abilities.add({
      spell: [
        SPELLS.GIFT_OF_THE_NAARU_DK,
        SPELLS.GIFT_OF_THE_NAARU_HUNTER,
        SPELLS.GIFT_OF_THE_NAARU_MONK,
        SPELLS.GIFT_OF_THE_NAARU_MAGE,
        SPELLS.GIFT_OF_THE_NAARU_PRIEST,
        SPELLS.GIFT_OF_THE_NAARU_PALADIN,
        SPELLS.GIFT_OF_THE_NAARU_SHAMAN,
        SPELLS.GIFT_OF_THE_NAARU_WARRIOR,
      ],
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      cooldown: 180,
      gcd: null,
    });
  }
}

export default GiftOfTheNaaru;

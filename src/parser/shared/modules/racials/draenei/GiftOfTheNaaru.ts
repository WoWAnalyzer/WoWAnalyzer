import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

/**
 * Heals the target for 20% of the caster's total health over 5 sec.
 */
class GiftOfTheNaaru extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Draenei;
    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: [
        SPELLS.GIFT_OF_THE_NAARU_DK.id,
        SPELLS.GIFT_OF_THE_NAARU_HUNTER.id,
        SPELLS.GIFT_OF_THE_NAARU_MONK.id,
        SPELLS.GIFT_OF_THE_NAARU_MAGE.id,
        SPELLS.GIFT_OF_THE_NAARU_PRIEST.id,
        SPELLS.GIFT_OF_THE_NAARU_PALADIN.id,
        SPELLS.GIFT_OF_THE_NAARU_SHAMAN.id,
        SPELLS.GIFT_OF_THE_NAARU_WARRIOR.id,
      ],
      category: SPELL_CATEGORY.DEFENSIVE,
      cooldown: 180,
      gcd: null,
    });
  }
}

export default GiftOfTheNaaru;

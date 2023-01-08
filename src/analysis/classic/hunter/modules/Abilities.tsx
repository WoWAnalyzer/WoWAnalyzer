import SPELLS from 'common/SPELLS/classic/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      {
        spell: SPELLS.AUTO_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: [SPELLS.ARCANE_SHOT.id, ...SPELLS.ARCANE_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
    ];
  }
}

export default Abilities;

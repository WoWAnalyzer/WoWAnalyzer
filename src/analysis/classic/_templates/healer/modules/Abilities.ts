import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.HEALING_TOUCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE

      // Cooldowns
      {
        spell: [SPELLS.NATURES_SWIFTNESS_DRUID.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },

      // Defensive

      // Other spells (not apart of the normal rotation)

      // Utility

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;

import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    return [
      {
        spell: SPELLS.DEVASTATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 1000, // 0.75 seconds or 1 second?
        },
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 1000, // is it actually 1 second for arcane explosion in classic?
        },
      },
      {
        spell: [SPELLS.HEROIC_STRIKE, ...lowRankSpells[SPELLS.HEROIC_STRIKE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500, // haste interaction not accounted for
        },
      },
      {
        spell: SPELLS.SHIELD_WALL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.LAST_STAND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.BATTLE_SHOUT, ...lowRankSpells[SPELLS.BATTLE_SHOUT]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.COMMANDING_SHOUT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.DEMORALIZING_SHOUT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
    ];
  }
}

export default Abilities;

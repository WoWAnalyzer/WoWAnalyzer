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
          minimum: 1000, 
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.REVENGE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 1000, 
        },
        cooldown: 5,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHIELD_BLOCK,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
          minimum: 1000, 
        },
        cooldown: 5,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 6,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
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
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 1800,
        gcd: null,
      },
      {
        spell: SPELLS.LAST_STAND,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 480,
        gcd: null,
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
      {
        spell: SPELLS.THUNDER_CLAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 4,
        gcd: {
          static: 1500,
        },
      },
    ];
  }
}

export default Abilities;

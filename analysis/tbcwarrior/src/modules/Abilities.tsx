import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import { Build } from '../CONFIG';
import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const build = this.owner.build;
    return [
      {
        spell: SPELLS.DEVASTATE,
        category:
          build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        castEfficiency: {
          suggestion: build === Build.DEFAULT ? true : false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.REVENGE,
        category:
          build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 5,
        castEfficiency: {
          suggestion: build === Build.DEFAULT ? true : false,
          recommendedEfficiency: 0.7,
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
          suggestion: build === Build.DEFAULT ? true : false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHIELD_SLAM,
        category:
          build === Build.DEFAULT
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 6,
        castEfficiency: {
          suggestion: build === Build.DEFAULT ? true : false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.MORTAL_STRIKE, ...lowRankSpells[SPELLS.MORTAL_STRIKE]],
        category:
          build === Build.ARMS
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 6,
        castEfficiency: {
          suggestion: build === Build.ARMS ? true : false,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.WHIRLWIND,
        category:
          build === Build.ARMS
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 10,
        castEfficiency: {
          suggestion: build === Build.ARMS ? true : false,
          recommendedEfficiency: 0.5,
        },
      },
      {
        spell: [SPELLS.SLAM, ...lowRankSpells[SPELLS.SLAM]],
        category:
          build === Build.ARMS
            ? Abilities.SPELL_CATEGORIES.ROTATIONAL
            : Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
          minimum: 1000,
        },
        cooldown: 0,
      },
      {
        spell: [SPELLS.HEROIC_STRIKE, ...lowRankSpells[SPELLS.HEROIC_STRIKE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500, // haste interaction not accounted for
        },
      },
      {
        spell: [SPELLS.CLEAVE, ...lowRankSpells[SPELLS.CLEAVE]],
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

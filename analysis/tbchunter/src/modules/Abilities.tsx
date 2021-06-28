import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import { Build } from '../CONFIG';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const build = this.owner.build;

    return [
      {
        spell: SPELLS.AUTO_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.STEADY_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6, // TODO: Talents
        gcd: {
          static: 1500,
        },
        lowerRanks: [3044, 14281, 14282, 14283, 14284, 14285, 14286, 14287],
      },
      {
        spell: SPELLS.MULTI_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 10,
        gcd: {
          static: 1500,
        },
        lowerRanks: [2643, 14288, 14289, 14290, 25294],
      },
      {
        spell: SPELLS.KILL_COMMAND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 5,
        gcd: null,
        // TODO: instead of cast efficiency use usage / proc rate
      },
      {
        spell: SPELLS.AIMED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19434, 20900, 20901, 20902, 20903, 20904],
      },
      {
        spell: SPELLS.RAPTOR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        gcd: {
          static: 1500,
        },
        lowerRanks: [2973, 14260, 14261, 14262, 14263, 14264, 14265, 14266],
      },
      {
        spell: SPELLS.SERPENT_STING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [1978, 13549, 13550, 13551, 13552, 13553, 13554, 13555, 25295],
      },
      {
        spell: SPELLS.RAPID_FIRE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300 - (build === Build.DEFAULT ? 120 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_HAWK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [13165, 14318, 14319, 14320, 14321, 14322, 25296],
      },
      {
        spell: SPELLS.ASPECT_OF_THE_VIPER,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.HUNTERS_MARK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19421, 19422, 19423, 19424],
      },
      // Traps
      {
        spell: SPELLS.EXPLOSIVE_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        lowerRanks: [13813, 14316, 14317],
      },
    ];
  }
}

export default Abilities;

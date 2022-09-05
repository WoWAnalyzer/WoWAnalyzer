import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { Build } from '../CONFIG';
import lowRankSpells from '../lowRankSpells';
import killCommandMaxCasts from '../metrics/killCommandMaxCasts';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const build = this.owner.build;

    return [
      {
        spell: SPELLS.AUTO_SHOT,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.STEADY_SHOT,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.ARCANE_SHOT, ...lowRankSpells[SPELLS.ARCANE_SHOT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6, // TODO: Talents
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MULTI_SHOT, ...lowRankSpells[SPELLS.MULTI_SHOT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.KILL_COMMAND,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 5,
        gcd: null,
        castEfficiency: {
          maxCasts: (cooldown) =>
            killCommandMaxCasts(this.owner.normalizedEvents, this.owner.info, cooldown * 1000),
          suggestion: true,
          recommendedEfficiency: 0.8,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineCastableBuff: SPELLS.KILL_COMMAND,
      },
      {
        spell: [SPELLS.AIMED_SHOT, ...lowRankSpells[SPELLS.AIMED_SHOT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RAPTOR_STRIKE, ...lowRankSpells[SPELLS.RAPTOR_STRIKE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SERPENT_STING, ...lowRankSpells[SPELLS.SERPENT_STING]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DISTRACTING_SHOT, ...lowRankSpells[SPELLS.DISTRACTING_SHOT]],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.RAPID_FIRE,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 300 - (build === Build.DEFAULT ? 120 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.ASPECT_OF_THE_HAWK, ...lowRankSpells[SPELLS.ASPECT_OF_THE_HAWK]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_VIPER,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SCORPID_STING,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HUNTERS_MARK, ...lowRankSpells[SPELLS.HUNTERS_MARK]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MEND_PET, ...lowRankSpells[SPELLS.MEND_PET]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.REVIVE_PET,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      // Traps
      {
        spell: [SPELLS.EXPLOSIVE_TRAP, ...lowRankSpells[SPELLS.EXPLOSIVE_TRAP]],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
      },
    ];
  }
}

export default Abilities;

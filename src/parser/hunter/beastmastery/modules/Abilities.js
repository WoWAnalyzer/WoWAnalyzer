import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        buffSpellId: SPELLS.BESTIAL_WRATH.id,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> should be cast on cooldown as its cooldown is quickly reset again through <SpellLink id={SPELLS.BARBED_SHOT.id} />. You want to start each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> window with as much focus as possible.
            </>
          ),
        },
      },
      {
        spell: SPELLS.KILL_COMMAND_CAST_BM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.COBRA_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DIRE_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.DIRE_BEAST_BUFF.id,
        cooldown: 15,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BARBED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.BARBED_SHOT_PET_BUFF.id, //shows pet buff, since that is what is interesting to see and the player buff is 5 different spellIDs
      },
      {
        spell: SPELLS.MULTISHOT_BM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        buffSpellId: SPELLS.BEAST_CLEAVE_BUFF.id,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_WILD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.ASPECT_OF_THE_WILD.id,
        cooldown: 120,
        gcd: {
          base: 1500, //This is set to 1500 currently, but it's altered to be accurate inside the GlobalCooldown module because it is currently bugged in-game
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BARRAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.STAMPEDE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.STAMPEDE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SPITTING_COBRA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.CHIMAERA_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 120,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SURVIVAL_OF_THE_FITTEST,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: [SPELLS.PRIMAL_RAGE_1, SPELLS.PRIMAL_RAGE_2],
        buffSpellId: [SPELLS.PRIMAL_RAGE_1.id, SPELLS.PRIMAL_RAGE_2.id],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 360,
        gcd: null,
      },

      {
        spell: SPELLS.MASTERS_CALL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: SPELLS.DISENGAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: null,
      },
      {
        spell: SPELLS.CONCUSSIVE_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.COUNTER_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        gcd: null,
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.INTIMIDATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BINDING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => {
          const bornToBeWildCDR = combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? 0.2 : 0;
          return 180 * (1 - bornToBeWildCDR);
        },
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: () => {
          const bornToBeWildCDR = combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? 0.2 : 0;
          return 180 * (1 - bornToBeWildCDR);
        },
        gcd: null,
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.CALL_PET_1, SPELLS.CALL_PET_2, SPELLS.CALL_PET_3, SPELLS.CALL_PET_4, SPELLS.CALL_PET_5],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISMISS_PET,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MEND_PET,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },

      /**
       * Racials until we find a better solution
       */
      {
        spell: SPELLS.BERSERKING,
        buffSpellId: SPELLS.BERSERKING.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [SPELLS.BLOOD_FURY_PHYSICAL, SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL, SPELLS.BLOOD_FURY_SPELL],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;

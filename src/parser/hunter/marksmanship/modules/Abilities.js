import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.AIMED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAPID_FIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
      },
      {
        spell: SPELLS.STEADY_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MULTISHOT_MM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: (
            <React.Fragment>
              <SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} /> should be used on cooldown, and you should aim to hit it in the center of the mobs, as that will be where it does the most damage.
            </React.Fragment>
          ),
        },
      },
      {
        spell: SPELLS.EXPLOSIVE_SHOT_DETONATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
      },
      {
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.HUNTERS_MARK_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.HUNTERS_MARK_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SERPENT_STING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DOUBLE_TAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.DOUBLE_TAP_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
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
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.PIERCING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.TRUESHOT,
        buffSpellId: SPELLS.TRUESHOT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
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
        spell: [SPELLS.SURVIVAL_OF_THE_FITTEST_LONE_WOLF, SPELLS.SURVIVAL_OF_THE_FITTEST],
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: SPELLS.PRIMAL_RAGE,
        buffSpellId: SPELLS.PRIMAL_RAGE.id,
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
        spell: SPELLS.BURSTING_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.BINDING_SHOT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: null,

      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
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
        spell: SPELLS.FLARE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
      },

      /**
       * Racials until we find a better solution
       */
      {
        spell: SPELLS.BERSERKING,
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

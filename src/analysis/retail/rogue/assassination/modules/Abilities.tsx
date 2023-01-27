import CoreAbilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // region Rotational
      {
        spell: SPELLS.GARROTE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SLICE_AND_DICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.SERRATED_BONE_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SERRATED_BONE_SPIKE_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.RUPTURE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SHIV.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 25,
        charges: 1 + combatant.getTalentRank(TALENTS.LIGHTWEIGHT_SHIV_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.MUTILATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.ENVENOM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.AMBUSH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.FAN_OF_KNIVES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.CRIMSON_TEMPEST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT),
        gcd: {
          base: 1000,
        },
      },
      // endregion

      // region Utility
      {
        spell: SPELLS.KIDNEY_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.SHADOWSTEP_SHARED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1,
        enabled:
          combatant.hasTalent(TALENTS.SHADOWSTEP_SHARED_TALENT) ||
          combatant.hasTalent(TALENTS.SHADOWSTEP_SPEC_TALENT),
        charges:
          combatant.getTalentRank(TALENTS.SHADOWSTEP_SHARED_TALENT) +
          combatant.getTalentRank(TALENTS.SHADOWSTEP_SPEC_TALENT),
      },
      {
        spell: TALENTS.THISTLE_TEA_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1,
        charges: 3,
        enabled: combatant.hasTalent(TALENTS.THISTLE_TEA_TALENT),
      },
      {
        spell: SPELLS.KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SPRINT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 2 * 60,
      },
      // endregion

      // region Defensives
      {
        spell: SPELLS.FEINT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 15,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 2 * 60,
        enabled: combatant.hasTalent(TALENTS.CLOAK_OF_SHADOWS_TALENT),
      },
      // endregion

      // region Cooldowns
      {
        spell: TALENTS.ECHOING_REPRIMAND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.EXSANGUINATE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 3 * 60,
        enabled: combatant.hasTalent(TALENTS.EXSANGUINATE_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.DEATHMARK_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 2 * 60,
        enabled: combatant.hasTalent(TALENTS.DEATHMARK_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.VANISH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 2 * 60,
      },
      {
        spell: TALENTS.INDISCRIMINATE_CARNAGE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.INDISCRIMINATE_CARNAGE_TALENT),
      },
      {
        spell: TALENTS.KINGSBANE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.KINGSBANE_TALENT),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.COLD_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.COLD_BLOOD_TALENT),
      },
      {
        spell: TALENTS.MARKED_FOR_DEATH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.MARKED_FOR_DEATH_TALENT),
      },
      // endregion
    ];
  }
}

export default Abilities;

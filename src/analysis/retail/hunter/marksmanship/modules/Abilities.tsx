import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_HUNTER } from 'common/TALENTS/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      /**
       * Shared spells handled in their own files:
       * Binding Shot
       * A Murder of Crows
       *
       */
      //region Baseline Rotational
      {
        spell: TALENTS.AIMED_SHOT_TALENT.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.AIMED_SHOT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => {
          return 15 / (1 + haste);
        },
        charges: 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.RAPID_FIRE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: this.selectedCombatant.hasTalent(TALENTS.RAPID_FIRE_TALENT),
        cooldown: 16,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ARCANE_SHOT.id,
        buffSpellId: TALENTS_HUNTER.PRECISE_SHOTS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STEADY_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MULTISHOT_MM.id,
        buffSpellId: TALENTS_HUNTER.PRECISE_SHOTS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TRUESHOT_TALENT.id,
        buffSpellId: TALENTS.TRUESHOT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT) ? 90 : 120,
        gcd: {
          static: 0,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.MOONLIGHT_CHAKRAM_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Talents
      {
        spell: TALENTS.VOLLEY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.VOLLEY_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.CAMOUFLAGE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.CAMOUFLAGE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLACK_ARROW_DAMAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.EXPLOSIVE_SHOT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WAILING_ARROW_DAMAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_HUNTER.WAILING_DEAD_TALENT),
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Baseline Defensives
      {
        spell: SPELLS.EXHILARATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: combatant.hasTalent(TALENTS.NATURAL_MENDING_TALENT) ? 60 : 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE.id,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown:
          180 -
          (combatant.hasTalent(TALENTS.IMPROVED_ASPECT_OF_THE_TURTLE_TALENT) ? 30 : 0) -
          combatant.getTalentRank(TALENTS.BORN_TO_BE_WILD_TALENT) * 15,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.SURVIVAL_OF_THE_FITTEST.id,
        enabled: combatant.hasTalent(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        charges: combatant.hasTalent(TALENTS.PADDED_ARMOR_TALENT) ? 2 : 1,
        cooldown: 120 - (combatant.hasTalent(TALENTS.LONE_SURVIVOR_TALENT) ? 30 : 0),
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.FORTITUDE_OF_THE_BEAR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: 120,
        gcd: {
          static: 0,
        },
      },
      //endregion

      //region Baseline Utility
      {
        spell: SPELLS.DISENGAGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.CONCUSSIVE_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.COUNTER_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 24,
        gcd: {
          static: 0,
        },
      },
      {
        spell: TALENTS.MISDIRECTION_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        // Cast/cooldown tracking is still useful even though nobody is trying to weave this
        // optimally - just don't give it its own Timeline lane.
        timelineHide: true,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          150 -
          (combatant.hasTalent(TALENTS.IMPROVED_ASPECT_OF_THE_CHEETAH_TALENT) ? 30 : 0) -
          combatant.getTalentRank(TALENTS.BORN_TO_BE_WILD_TALENT) * 15 -
          (combatant.hasTalent(TALENTS.CONDITIONING_TALENT) ? 30 : 0),
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.FREEZING_TRAP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAR_TRAP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLARE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HUNTERS_MARK.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.WING_CLIP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRANQUILIZING_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HARRIERS_CRY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 360,
        gcd: {
          static: 0,
        },
      },
      //endregion

      //region Pets
      {
        spell: [SPELLS.PRIMAL_RAGE_1.id, SPELLS.PRIMAL_RAGE_2.id],
        buffSpellId: [SPELLS.PRIMAL_RAGE_1.id, SPELLS.PRIMAL_RAGE_2.id],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 360,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.MASTERS_CALL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.INTIMIDATION_MM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INTIMIDATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.CALL_PET_1.id,
          SPELLS.CALL_PET_2.id,
          SPELLS.CALL_PET_3.id,
          SPELLS.CALL_PET_4.id,
          SPELLS.CALL_PET_5.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISMISS_PET.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MEND_PET.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      //endregion
    ];
  }
}

export default Abilities;

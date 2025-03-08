import { BORN_TO_BE_WILD_CD_REDUCTION } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
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
       * Kill Shot
       * A Murder of Crows
       *
       */
      //region Baseline Rotational
      {
        spell: TALENTS.AIMED_SHOT_TALENT.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.AIMED_SHOT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => {
          return 12 / (1 + haste);
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
        spell: SPELLS.RAPID_FIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
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
        buffSpellId: SPELLS.PRECISE_SHOTS.id,
        category: SPELL_CATEGORY.ROTATIONAL,

        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STEADY_SHOT.id,
        buffSpellId: SPELLS.STEADY_FOCUS_BUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MULTISHOT_MM.id,
        buffSpellId: SPELLS.PRECISE_SHOTS.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRUESHOT.id,
        buffSpellId: SPELLS.TRUESHOT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          static: 0,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      //endregion

      //region Talents
      {
        spell: TALENTS.EXPLOSIVE_SHOT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        buffSpellId: TALENTS.EXPLOSIVE_SHOT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS.BARRAGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS.BARRAGE_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
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
        enabled: combatant.hasTalent(TALENTS.BLACK_ARROW_TALENT),
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
        cooldown: 120,
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
          180 *
          (1 -
            BORN_TO_BE_WILD_CD_REDUCTION[combatant.getTalentRank(TALENTS.BORN_TO_BE_WILD_TALENT)]),
        gcd: {
          static: 0,
        },
      },
      {
        spell: [SPELLS.SURVIVAL_OF_THE_FITTEST_LONE_WOLF.id, SPELLS.SURVIVAL_OF_THE_FITTEST.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
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
        spell: SPELLS.BURSTING_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 24,
        gcd: {
          base: 1500,
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
        spell: SPELLS.MISDIRECTION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          180 *
          (1 -
            BORN_TO_BE_WILD_CD_REDUCTION[combatant.getTalentRank(TALENTS.BORN_TO_BE_WILD_TALENT)]),
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

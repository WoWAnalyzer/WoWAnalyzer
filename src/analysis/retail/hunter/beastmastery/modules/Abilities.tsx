import {
  BORN_TO_BE_WILD_CD_REDUCTION,
  hastedCooldown,
} from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Baseline Rotational
      {
        spell: SPELLS.ARCANE_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Talents
      {
        spell: TALENTS.COBRA_SHOT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.COBRA_SHOT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => hastedCooldown(7.5, haste),
        charges: combatant.hasTalent(TALENTS.ALPHA_PREDATOR_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: TALENTS.BARBED_SHOT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BARBED_SHOT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: 2,
        cooldown: (haste) => hastedCooldown(12, haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MULTI_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BESTIAL_WRATH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: -1,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: (
            <>
              <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> should be cast on cooldown as its
              cooldown is quickly reset again through{' '}
              <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />.
            </>
          ),
        },
      },
      {
        spell: TALENTS.DIRE_BEAST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.DIRE_BEAST_TALENT),
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
        spell: TALENTS.BARRAGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.BARRAGE_TALENT),
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: TALENTS.BLOODSHED_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.BLOODSHED_TALENT),
        cooldown: 60,
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
        spell: TALENTS.CALL_OF_THE_WILD_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.CALL_OF_THE_WILD_TALENT),
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Baseline Defensives
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
        spell: SPELLS.EXHILARATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SURVIVAL_OF_THE_FITTEST.id,
        enabled: combatant.hasTalent(TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown:
          (180 - (combatant.hasTalent(TALENTS.LONE_SURVIVOR_TALENT) ? 30 : 0)) *
          (1 -
            BORN_TO_BE_WILD_CD_REDUCTION[combatant.getTalentRank(TALENTS.BORN_TO_BE_WILD_TALENT)]),
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
        spell: SPELLS.MISDIRECTION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
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
        spell: SPELLS.FEIGN_DEATH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 0,
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

import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import {
  BORN_TO_BE_WILD_CD_REDUCTION,
  CALL_OF_THE_WILD_CD_REDUCTION,
  HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK,
  hastedCooldown,
} from '@wowanalyzer/hunter';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Baseline Rotational
      {
        spell: SPELLS.KILL_COMMAND_CAST_SV.id,
        buffSpellId: SPELLS.FLANKERS_ADVANTAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id) ? 2 : 1,
        cooldown: (haste) => hastedCooldown(6, haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id) ? 0.65 : 0.85,
        },
      },
      {
        spell: [SPELLS.RAPTOR_STRIKE.id, SPELLS.RAPTOR_STRIKE_AOTE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.WILDFIRE_BOMB.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id),
        charges: combatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id) ? 2 : 1,
        cooldown: (haste) => hastedCooldown(18, haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.SERPENT_STING_SV.id,
        buffSpellId: SPELLS.VIPERS_VENOM_BUFF.id, //to show users of the Vipers Venom talent when they were casting Serpent Sting with Viper's Venom active in the timeline
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.CARVE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.COORDINATED_ASSAULT.id,
        buffSpellId: SPELLS.COORDINATED_ASSAULT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown:
          120 *
          (1 -
            (combatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
              ? CALL_OF_THE_WILD_CD_REDUCTION
              : 0)),
        gcd: {
          static: 0,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
        timelineSortIndex: 6,
      },
      //endregion

      //region Talents
      {
        spell: [SPELLS.MONGOOSE_BITE_TALENT.id, SPELLS.MONGOOSE_BITE_TALENT_AOTE.id],
        buffSpellId: SPELLS.MONGOOSE_FURY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.STEEL_TRAP_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: [SPELLS.FLANKING_STRIKE_TALENT.id, SPELLS.FLANKING_STRIKE_PLAYER.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.FLANKING_STRIKE_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [
          SPELLS.VOLATILE_BOMB_WFI.id,
          SPELLS.PHEROMONE_BOMB_WFI.id,
          SPELLS.SHRAPNEL_BOMB_WFI.id,
          SPELLS.WILDFIRE_INFUSION_TALENT.id,
        ],
        shownSpell: SPELLS.WILDFIRE_INFUSION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id),
        charges: combatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id) ? 2 : 1,
        cooldown: (haste) => hastedCooldown(18, haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.CHAKRAMS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.CHAKRAMS_TALENT.id),
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
        spell: SPELLS.BUTCHERY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        charges: 3,
        cooldown: (haste) => hastedCooldown(9, haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.CAMOUFLAGE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.CAMOUFLAGE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Defensives
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
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE.id,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown:
          (180 -
            (combatant.hasConduitBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id)
              ? HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK[
                  combatant.conduitRankBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id)
                ]
              : 0)) *
          (1 -
            (combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id)
              ? BORN_TO_BE_WILD_CD_REDUCTION
              : 0)) *
          (1 -
            (combatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
              ? CALL_OF_THE_WILD_CD_REDUCTION
              : 0)),
        gcd: {
          static: 0,
        },
      },
      //endregion

      //region Utility
      {
        spell: SPELLS.ASPECT_OF_THE_EAGLE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          90 *
          (1 -
            (combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id)
              ? BORN_TO_BE_WILD_CD_REDUCTION
              : 0)) *
          (1 -
            (combatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
              ? CALL_OF_THE_WILD_CD_REDUCTION
              : 0)),
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
            (combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id)
              ? BORN_TO_BE_WILD_CD_REDUCTION
              : 0)) *
          (1 -
            (combatant.hasLegendary(SPELLS.CALL_OF_THE_WILD_EFFECT)
              ? CALL_OF_THE_WILD_CD_REDUCTION
              : 0)),
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.HARPOON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.MUZZLE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
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
        castEfficiency: {
          suggestion: this.selectedCombatant.hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
          recommendedEfficiency: 0.55,
        },
      },
      {
        spell: SPELLS.FLARE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: this.selectedCombatant.hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
          recommendedEfficiency: 0.9,
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
        spell: SPELLS.MISDIRECTION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 0,
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
        spell: SPELLS.INTIMIDATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
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

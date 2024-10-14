import { hastedCooldown } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { EXPLOSIVES_EXPERT_CDR } from 'analysis/retail/hunter/survival/constants';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Baseline Rotational
      {
        spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.KILL_COMMAND_SURVIVAL_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(TALENTS.ALPHA_PREDATOR_TALENT) ? 2 : 1,
        cooldown: (haste) => hastedCooldown(6, haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(TALENTS.ALPHA_PREDATOR_TALENT) ? 0.65 : 0.85,
        },
      },
      {
        spell: [TALENTS.RAPTOR_STRIKE_TALENT.id, SPELLS.RAPTOR_STRIKE_AOTE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
      },
      {
        spell: TALENTS.WILDFIRE_BOMB_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WILDFIRE_BOMB_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(TALENTS.GUERRILLA_TACTICS_TALENT) ? 2 : 1,
        cooldown: (haste) =>
          hastedCooldown(
            18 - EXPLOSIVES_EXPERT_CDR[combatant.getTalentRank(TALENTS.EXPLOSIVES_EXPERT_TALENT)],
            haste,
          ),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.SERPENT_STING_SURVIVAL.id,
        enabled: !combatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      //endregion

      //region Talents
      {
        spell: [TALENTS.MONGOOSE_BITE_TALENT.id, SPELLS.MONGOOSE_BITE_TALENT_AOTE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: [TALENTS.FLANKING_STRIKE_TALENT.id, SPELLS.FLANKING_STRIKE_PLAYER.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT),
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
        spell: TALENTS.EXPLOSIVE_SHOT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BUTCHERY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.BUTCHERY_TALENT),
        charges: 3,
        cooldown: (haste) => hastedCooldown(9, haste),
        gcd: {
          base: 1500,
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
      //endregion

      //region Cooldowns
      {
        spell: [TALENTS.COORDINATED_ASSAULT_TALENT.id],
        enabled: combatant.hasTalent(TALENTS.COORDINATED_ASSAULT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.SYMBIOTIC_ADRENALINE_TALENT) ? 60 : 120,
        gcd: {
          static: 0,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
        timelineSortIndex: 6,
      },
      {
        spell: TALENTS.SPEARHEAD_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPEARHEAD_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.DEADLY_DUO_TALENT) ? 60 : 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.FURY_OF_THE_EAGLE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FURY_OF_THE_EAGLE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
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
        category: SPELL_CATEGORY.DEFENSIVE,
        isDefensive: true,
        cooldown: combatant.hasTalent(TALENTS.BORN_TO_BE_WILD_TALENT) ? 150 : 180,
        gcd: {
          static: 0,
        },
      },
      //endregion

      //region Utility
      {
        spell: SPELLS.ASPECT_OF_THE_EAGLE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.BORN_TO_BE_WILD_TALENT) ? 60 : 90,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.BORN_TO_BE_WILD_TALENT) ? 150 : 180,
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
        spell: TALENTS.MUZZLE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.MUZZLE_TALENT),
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

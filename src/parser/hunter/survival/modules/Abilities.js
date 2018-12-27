import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.KILL_COMMAND_CAST_SV,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.FLANKERS_ADVANTAGE.id,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id) ? 0.65 : .85,
        },
        timelineSortIndex: 3,
        charges: combatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id) ? 2 : 1,
        cooldown: haste => 6 / (1 + haste),
      },
      {
        spell: [SPELLS.RAPTOR_STRIKE, SPELLS.RAPTOR_STRIKE_AOTE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: !combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
      },
      {
        spell: [SPELLS.MONGOOSE_BITE_TALENT, SPELLS.MONGOOSE_BITE_TALENT_AOTE],
        buffSpellId: SPELLS.MONGOOSE_FURY.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.WILDFIRE_BOMB,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: !combatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .85,
        },
        charges: combatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id) ? 2 : 1,
        cooldown: haste => 18 / (1 + haste),
      },
      {
        spell: SPELLS.SERPENT_STING_SV,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.VIPERS_VENOM_BUFF.id, //to show users of the Vipers Venom talent when they were casting Serpent Sting with Viper's Venom active in the timeline
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.CARVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        cooldown: haste => 6 / (1 + haste),
      },
      {
        spell: SPELLS.COORDINATED_ASSAULT,
        buffSpellId: SPELLS.COORDINATED_ASSAULT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .85,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.STEEL_TRAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: [SPELLS.FLANKING_STRIKE_TALENT, SPELLS.FLANKING_STRIKE_PLAYER],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FLANKING_STRIKE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.VOLATILE_BOMB_WFI, SPELLS.PHEROMONE_BOMB_WFI, SPELLS.SHRAPNEL_BOMB_WFI, SPELLS.WILDFIRE_INFUSION_TALENT],
        shownSpell: SPELLS.WILDFIRE_INFUSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .85,
        },
        charges: combatant.hasTalent(SPELLS.GUERRILLA_TACTICS_TALENT.id) ? 2 : 1,
        cooldown: haste => 18 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id),
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.CHAKRAMS_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.CHAKRAMS_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BUTCHERY_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: haste => 9 / (1 + haste),
        charges: 3,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_EAGLE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: () => {
          const bornToBeWildCDR = combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? 0.2 : 0;
          return 90 * (1 - bornToBeWildCDR);
        },
        gcd: null,
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
        spell: SPELLS.HARPOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
        cooldown: 20,
      },
      {
        spell: SPELLS.MUZZLE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.DISENGAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
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
      {
        spell: SPELLS.WING_CLIP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        spell: SPELLS.INTIMIDATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
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
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
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

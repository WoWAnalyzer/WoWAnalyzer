import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import { BORN_TO_BE_WILD_CD_REDUCTION, CALL_OF_THE_WILD_CD_REDUCTION, HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK, hastedCooldown } from 'parser/hunter/shared/constants';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Baseline Rotational
      {
        spell: SPELLS.BESTIAL_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
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
              <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> should be cast on cooldown as its cooldown is quickly reset again through <SpellLink id={SPELLS.BARBED_SHOT.id} />. You want to start each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> window with as much focus as possible.
            </>
          ),
        },
      },
      {
        spell: SPELLS.KILL_COMMAND_CAST_BM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => hastedCooldown(7.5, haste),
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
        spell: SPELLS.ARCANE_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BARBED_SHOT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: haste => hastedCooldown(this.selectedCombatant.hasConduitBySpellID(SPELLS.BLOODLETTING_CONDUIT.id) ? 11 : 12, haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MULTISHOT_BM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPECT_OF_THE_WILD,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120 * (1 - (combatant.hasLegendaryByBonusID(SPELLS.CALL_OF_THE_WILD_EFFECT.id) ? CALL_OF_THE_WILD_CD_REDUCTION : 0)),
        gcd: {
          static: 0,
        },
        timelineSortIndex: -1,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      //endregion

      //region Baseline Defensives
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        buffSpellId: SPELLS.ASPECT_OF_THE_TURTLE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: (180
          - (combatant.hasConduitBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id) ? HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK[combatant.conduitRankBySpellID(SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id)] : 0))
          * (1 - (combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? BORN_TO_BE_WILD_CD_REDUCTION : 0))
          * (1 - (combatant.hasLegendaryByBonusID(SPELLS.CALL_OF_THE_WILD_EFFECT.id) ? CALL_OF_THE_WILD_CD_REDUCTION : 0)),
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SURVIVAL_OF_THE_FITTEST,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isDefensive: true,
        cooldown: 180,
        gcd: {
          static: 0,
        },
      },
      //endregion

      //region Baseline Utility
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180
          * (1 - (combatant.hasTalent(SPELLS.BORN_TO_BE_WILD_TALENT.id) ? BORN_TO_BE_WILD_CD_REDUCTION : 0))
          * (1 - (combatant.hasLegendaryByBonusID(SPELLS.CALL_OF_THE_WILD_EFFECT.id) ? CALL_OF_THE_WILD_CD_REDUCTION : 0)),
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.DISENGAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          static: 0,
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
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.MISDIRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SOULFORGE_EMBERS_EFFECT.bonusID),
          recommendedEfficiency: 0.55,
        },
      },
      {
        spell: SPELLS.FEIGN_DEATH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.FLARE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SOULFORGE_EMBERS_EFFECT.bonusID),
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.HUNTERS_MARK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1000,
        },
      },
      //endregion

      //region Talents
      {
        spell: SPELLS.DIRE_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id),
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.BARRAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
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
        spell: SPELLS.STAMPEDE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.STAMPEDE_TALENT.id),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY.id),
        cooldown: haste => hastedCooldown(15, haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.BLOODSHED_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.BLOODSHED_TALENT.id),
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
        spell: SPELLS.CAMOUFLAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.CAMOUFLAGE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      //endregion

      //region Pets
      {
        spell: [SPELLS.PRIMAL_RAGE_1, SPELLS.PRIMAL_RAGE_2],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 360,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.MASTERS_CALL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          static: 0,
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
        spell: [
          SPELLS.CALL_PET_1,
          SPELLS.CALL_PET_2,
          SPELLS.CALL_PET_3,
          SPELLS.CALL_PET_4,
          SPELLS.CALL_PET_5,
        ],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISMISS_PET,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
      //endregion
    ];
  }
}

export default Abilities;

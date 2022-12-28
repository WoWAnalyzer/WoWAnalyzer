import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SPECS from 'game/SPECS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

// TODO: this mixes preservation talents in but not devastation talents
class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Rotational Spells
      {
        spell: SPELLS.DISINTEGRATE.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EMERALD_BLOSSOM_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      //endregion
      //region Damage Spells
      {
        spell: combatant.hasTalent(TALENTS.FONT_OF_MAGIC_TALENT)
          ? SPELLS.FIRE_BREATH_FONT.id
          : SPELLS.FIRE_BREATH.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 500,
        },
        ...(combatant.spec === SPECS.DEVASTATION_EVOKER && {
          castEfficiency: {
            suggestion: true,
            recommendedEfficiency: 0.95,
          },
        }),
      },
      {
        spell: SPELLS.LIVING_FLAME_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.AZURE_STRIKE.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      //endregion
      //region Cooldowns
      {
        spell: SPELLS.DEEP_BREATH.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.HEALER_DAMAGING_SPELL
            : SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.LANDSLIDE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.LANDSLIDE_TALENT),
      },
      {
        spell: TALENTS.OBSIDIAN_SCALES_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        charges: combatant.hasTalent(TALENTS.OBSIDIAN_BULWARK_TALENT) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS.OBSIDIAN_SCALES_TALENT),
      },
      {
        spell: TALENTS.VERDANT_EMBRACE_TALENT.id,
        category:
          combatant.spec === SPECS.PRESERVATION_EVOKER
            ? SPELL_CATEGORY.ROTATIONAL
            : SPELL_CATEGORY.COOLDOWNS,
        cooldown: 24,
        enabled: combatant.hasTalent(TALENTS.VERDANT_EMBRACE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CAUTERIZING_FLAME_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.CAUTERIZING_FLAME_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TIP_THE_SCALES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.TIP_THE_SCALES_TALENT),
      },
      {
        spell: TALENTS.RENEWING_BLAZE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS.RENEWING_BLAZE_TALENT),
      },
      {
        spell: TALENTS.ZEPHYR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.ZEPHYR_TALENT),
        gcd: {
          base: 1500,
        },
      },
      //endregion
      //region Utility
      {
        spell: TALENTS.EXPUNGE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        enabled: combatant.hasTalent(TALENTS.EXPUNGE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SLEEP_WALK_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SLEEP_WALK_TALENT),
      },
      {
        spell: TALENTS.QUELL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 40,
        enabled: combatant.hasTalent(TALENTS.QUELL_TALENT),
      },
      {
        spell: TALENTS.UNRAVEL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 9,
        enabled: combatant.hasTalent(TALENTS.UNRAVEL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.OPPRESSING_ROAR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.OPPRESSING_ROAR_TALENT),
      },
      {
        spell: TALENTS.RESCUE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.RESCUE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TIME_SPIRAL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.TIME_SPIRAL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOVER.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 35,
        charges: combatant.hasTalent(TALENTS.AERIAL_MASTERY_TALENT) ? 2 : 1,
        gcd: null,
        enabled: true,
      },
      //endregion
      //region Other
      {
        spell: SPELLS.BLESSING_OF_THE_BRONZE.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SOURCE_OF_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SOURCE_OF_MAGIC_TALENT),
      },
      //endregion
    ];
  }
}

export default Abilities;

import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      //region Rotational Spells
      {
        spell: SPELLS.LIVING_FLAME.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISINTEGRATE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REVERSION.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        charges: 1,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REVERSION.id),
      },
      {
        spell: SPELLS.DREAM_BREATH.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ECHO.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TIME_DILATION.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.TIME_DILATION.id),
      },
      {
        spell: SPELLS.SPIRITBLOSSOM.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SPIRITBLOSSOM.id),
      },
      {
        spell: SPELLS.TEMPORAL_ANOMALY.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.TEMPORAL_ANOMALY.id),
      },
      //endregion
      //region Damage Spells
      {
        spell: SPELLS.FIRE_BREATH.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 30,
        gcd: {
          base: 500,
        },
      },
      {
        spell: SPELLS.AZURE_STRIKE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      //endregion
      //region Cooldowns
      {
        spell: SPELLS.DEEP_BREATH.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REWIND.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 240,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REWIND.id),
      },
      {
        spell: SPELLS.EMERALD_COMMUNION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EMERALD_COMMUNION.id),
      },
      {
        spell: SPELLS.DREAM_FLIGHT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.DREAM_FLIGHT.id),
      },
      {
        spell: SPELLS.EMERALD_COMMUNION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EMERALD_COMMUNION.id),
      },
      {
        spell: SPELLS.RESCUE.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 24,
        enabled: combatant.hasTalent(SPELLS.RESCUE.id),
      },
      {
        spell: SPELLS.CAUTERIZING_FLAME.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.CAUTERIZING_FLAME.id),
      },
      {
        spell: SPELLS.TIP_THE_SCALES.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.TIP_THE_SCALES.id),
      },
      {
        spell: SPELLS.RENEWING_BLAZE.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.RENEWING_BLAZE.id),
      },
      {
        spell: SPELLS.ZEPHYR.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.ZEPHYR.id),
      },
      //endregion
      //region Utility
      {
        spell: SPELLS.OBSIDIAN_SCALES.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 150,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.OBSIDIAN_SCALES.id),
      },
      {
        spell: SPELLS.LANDSLIDE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.LANDSLIDE.id),
      },
      {
        spell: SPELLS.EXPUNGE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        enabled: combatant.hasTalent(SPELLS.EXPUNGE.id),
      },
      {
        spell: SPELLS.SLEEP_WALK.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SLEEP_WALK.id),
      },
      {
        spell: SPELLS.QUELL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.QUELL.id),
      },
      {
        spell: SPELLS.UNRAVEL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 9,
        enabled: combatant.hasTalent(SPELLS.UNRAVEL.id),
      },
      {
        spell: SPELLS.OPPRESSING_ROAR.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.OPPRESSING_ROAR.id),
      },
      {
        spell: SPELLS.FLY_WITH_ME.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.FLY_WITH_ME.id),
      },
      {
        spell: SPELLS.TIME_SPIRAL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.TIME_SPIRAL.id),
      },
      //endregion
      //region Other
      {
        spell: SPELLS.BLESSING_OF_THE_BRONZE.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOURCE_OF_MAGIC.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.SOURCE_OF_MAGIC.id),
      },
      //endregion
    ];
  }
}

export default Abilities;

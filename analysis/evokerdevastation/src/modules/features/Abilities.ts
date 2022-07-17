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
        spell: SPELLS.PYRE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.PYRE.id),
      },
      {
        spell: SPELLS.LIVING_FLAME.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DRAGONRAGE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DRAGONRAGE.id),
      },
      {
        spell: SPELLS.ETERNITY_SURGE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ETERNITY_SURGE.id),
      },
      {
        spell: SPELLS.FIRESTORM.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FIRESTORM.id),
      },
      {
        spell: SPELLS.CHARGED_BLAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.CHARGED_BLAST.id),
      },
      //endregion
      //region Cooldowns
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
        spell: SPELLS.QUELL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.IMPOSING_PRESENCE) ? 20 : 40,
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
        spell: SPELLS.EXPUNGE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        enabled: combatant.hasTalent(SPELLS.EXPUNGE.id),
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
        spell: SPELLS.SLEEP_WALK.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SLEEP_WALK.id),
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

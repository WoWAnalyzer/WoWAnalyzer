import SPELLS from 'common/SPELLS/classic/shaman';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    const faction = combatant._combatantInfo.faction === 1 ? 'Alliance' : 'Horde';
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.EARTH_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FLAME_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.LAVA_BURST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SEARING_TOTEM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 }, // When not cast as part of a group
      },
      {
        spell: SPELLS.UNLEASH_ELEMENTS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.CHAIN_LIGHTNING.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: SPELLS.ELEMENTAL_MASTERY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180, // Max CD
      },
      {
        spell: SPELLS.FIRE_ELEMENTAL_TOTEM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 }, // When not cast as part of a group
        cooldown: 600,
      },
      // Defensive
      {
        spell: SPELLS.EARTH_ELEMENTAL_TOTEM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1000 }, // When not cast as part of a group
        cooldown: 600,
      },
      {
        spell: SPELLS.WIND_SHEAR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 5, // Assuming Reverberation Rank 2 Talent selection
      },
      // Other spells (not apart of the normal rotation)

      // Utility
      {
        spell: SPELLS.BLOODLUST.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        enabled: faction === 'Horde',
      },
      {
        spell: SPELLS.HEROISM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        enabled: faction === 'Alliance',
      },
      {
        spell: [SPELLS.CLEANSE_SPIRIT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROST_SHOCK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAVA_SURGE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.LIGHTNING_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.PURGE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.THUNDERSTORM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 45,
      },
      {
        spell: [SPELLS.WATER_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // ---------------
      // TOTEM RELATED
      // TODO: Need GCD modification for single cast totems when group is casted
      // WCLs is showing both casts
      // ---------------
      // Groups
      {
        spell: [SPELLS.CALL_OF_THE_ANCESTORS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_ELEMENTS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_SPIRITS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Air Totems
      {
        spell: [SPELLS.GROUNDING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.WINDFURY_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.WRATH_OF_AIR_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      // Earth Totems
      {
        spell: [SPELLS.EARTHBIND_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STONECLAW_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STONESKIN_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STRENGTH_OF_EARTH_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.TREMOR_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      // Fire Totems
      {
        spell: [SPELLS.FLAMETONGUE_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.MAGMA_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      // Water Totems
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.MANA_SPRING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.TOTEM_OF_TRANQUIL_MIND.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      // Misc
      {
        spell: [SPELLS.TOTEMIC_RECALL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Consumable
    ];
  }
}

export default Abilities;

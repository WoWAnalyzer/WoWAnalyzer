import SPELLS from 'common/SPELLS/classic/shaman';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    const faction = combatant._combatantInfo.faction === 1 ? 'Alliance' : 'Horde';
    return [
      // Rotational
      {
        spell: [SPELLS.LIGHTNING_BOLT.id, ...SPELLS.LIGHTNING_BOLT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STORMSTRIKE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FLAME_SHOCK.id, ...SPELLS.FLAME_SHOCK.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MAGMA_TOTEM.id, ...SPELLS.MAGMA_TOTEM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.LIGHTNING_SHIELD.id, ...SPELLS.LIGHTNING_SHIELD.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.EARTH_SHOCK.id, ...SPELLS.EARTH_SHOCK.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FIRE_NOVA.id, ...SPELLS.FIRE_NOVA.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAVA_LASH.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.CHAIN_LIGHTNING.id, ...SPELLS.CHAIN_LIGHTNING.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.FIRE_ELEMENTAL_TOTEM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
        cooldown: 600,
      },
      {
        spell: [SPELLS.FERAL_SPIRIT.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.BLOODLUST.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 600,
        enabled: faction === 'Horde',
      },
      {
        spell: [SPELLS.HEROISM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 600,
        enabled: faction === 'Alliance',
      },
      {
        spell: [SPELLS.SHAMANISTIC_RAGE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      {
        spell: [SPELLS.EARTH_ELEMENTAL_TOTEM.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.REINCARNATION.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      // Defensive

      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.HEALING_WAVE.id, ...SPELLS.HEALING_WAVE.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LESSER_HEALING_WAVE.id, ...SPELLS.LESSER_HEALING_WAVE.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CHAIN_HEAL.id, ...SPELLS.CHAIN_HEAL.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.CURE_TOXINS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CLEANSE_SPIRIT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROST_SHOCK.id, ...SPELLS.FROST_SHOCK.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_ANCESTORS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_ELEMENTS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.CALL_OF_THE_SPIRITS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.CLEANSING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.EARTHBIND_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.FIRE_RESISTANCE_TOTEM.id, ...SPELLS.FIRE_RESISTANCE_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.FLAMETONGUE_TOTEM.id, ...SPELLS.FLAMETONGUE_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.FROST_RESISTANCE_TOTEM.id, ...SPELLS.FROST_RESISTANCE_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.GROUNDING_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.HEALING_STREAM_TOTEM.id, ...SPELLS.HEALING_STREAM_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.LIGHTNING_SHIELD.id, ...SPELLS.LIGHTNING_SHIELD.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MANA_SPRING_TOTEM.id, ...SPELLS.MANA_SPRING_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.NATURE_RESISTANCE_TOTEM.id, ...SPELLS.NATURE_RESISTANCE_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.PURGE.id, ...SPELLS.PURGE.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STONECLAW_TOTEM.id, ...SPELLS.STONECLAW_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STONESKIN_TOTEM.id, ...SPELLS.STONESKIN_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.STRENGTH_OF_EARTH_TOTEM.id, ...SPELLS.STRENGTH_OF_EARTH_TOTEM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.TOTEMIC_CALL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TREMOR_TOTEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.WATER_SHIELD.id, ...SPELLS.WATER_SHIELD.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.WIND_SHEAR.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
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
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;

import SPELLS from 'common/SPELLS/classic/mage';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.DEEP_FREEZE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEEP_FREEZE_TALENT.id,
        category: SPELL_CATEGORY.HIDDEN, // Shows as double cast in the logs
        gcd: null,
      },
      {
        spell: SPELLS.FROSTFIRE_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.ICE_LANCE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.BLIZZARD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BLIZZARD_TICK.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
      },
      {
        spell: SPELLS.CONE_OF_COLD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
        cooldown: 8, // with Talent - Ice Floes (Rank 3)
      },
      // Cooldowns
      {
        spell: SPELLS.COLD_SNAP.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 384, // with Talent - Ice Floes (Rank 3)
      },
      {
        spell: SPELLS.FROSTFIRE_ORB.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      {
        spell: SPELLS.ICY_VEINS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 144, // with Talent - Ice Floes (Rank 3)
      },
      {
        spell: SPELLS.MIRROR_IMAGE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: SPELLS.SUMMON_WATER_ELEMENTAL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      // Defensive
      {
        spell: SPELLS.FROST_NOVA.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 20, // with Talent - Ice Floes (Rank 3)
      },
      {
        spell: SPELLS.ICE_BARRIER.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 24, // with Talent - Ice Floes (Rank 3)
      },
      {
        spell: SPELLS.ICE_BLOCK.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 240, // with Talent - Ice Floes (Rank 3)
      },
      {
        spell: SPELLS.INVISIBILITY.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MANA_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.RING_OF_FROST.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 120,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FIREBALL.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SCORCH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BLINK.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.COUNTERSPELL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.EVOCATION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MAGE_ARMOR.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MAGE_WARD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MOLTEN_ARMOR.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SPELLSTEAL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.TIME_WARP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Consumable
      {
        spell: SPELLS.REPLENISH_MANA.id,
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: null,
        cooldown: 120,
      },
    ];
  }
}

export default Abilities;

import SPELLS from 'common/SPELLS/classic/mage';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: [SPELLS.ARCANE_MISSILES.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ARCANE_BLAST.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ARCANE_BARRAGE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FLAME_ORB.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      // Rotational AOE
      {
        spell: [SPELLS.ARCANE_EXPLOSION.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1000 },
      },
      // Cooldowns
      {
        spell: [SPELLS.ARCANE_POWER.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90, // with the Talent - Arcane Flows Rank 2
        gcd: null,
      },
      {
        spell: [SPELLS.REPLENISH_MANA.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: [SPELLS.PRESENCE_OF_MIND.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90, // with the Talent - Arcane Flows Rank 2
        gcd: null,
      },
      {
        spell: [SPELLS.MIRROR_IMAGE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: [SPELLS.FROST_NOVA.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICE_BLOCK.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.INVISIBILITY.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MAGE_WARD.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MANA_SHIELD.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RING_OF_FROST.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 120,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.BLIZZARD.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CONE_OF_COLD.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FLAMESTRIKE.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROSTBOLT.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROSTFIRE_BOLT.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FIRE_BLAST.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FIREBALL.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICE_LANCE.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SCORCH.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.BLINK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CONJURE_MANA_GEM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.COUNTERSPELL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.EVOCATION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 120, // with the Talent - Arcane Flows Rank 2
      },
      {
        spell: SPELLS.MAGE_ARMOR.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MOLTEN_ARMOR.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REMOVE_CURSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [
          SPELLS.POLYMORPH.id,
          SPELLS.POLYMORPH_BLACK_CAT.id,
          SPELLS.POLYMORPH_PIG.id,
          SPELLS.POLYMORPH_RABBIT.id,
          SPELLS.POLYMORPH_TURKEY.id,
          SPELLS.POLYMORPH_TURTLE.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SPELLSTEAL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Consumable
    ];
  }
}

export default Abilities;

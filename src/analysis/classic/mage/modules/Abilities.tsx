import SPELLS from 'common/SPELLS/classic/mage';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: [SPELLS.ARCANE_BLAST.id, ...SPELLS.ARCANE_BLAST.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        buffSpellId: SPELLS.ARCANE_BLAST_DEBUFF.id,
      },
      {
        spell: [SPELLS.ARCANE_MISSILES.id, ...SPELLS.ARCANE_MISSILES.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ARCANE_BARRAGE.id, ...SPELLS.ARCANE_BARRAGE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICE_LANCE.id, ...SPELLS.ICE_LANCE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROSTBOLT.id, ...SPELLS.FROSTBOLT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROSTFIRE_BOLT.id, ...SPELLS.FROSTFIRE_BOLT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FIREBALL.id, ...SPELLS.FIREBALL.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SCORCH.id, ...SPELLS.SCORCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PYROBLAST.id, ...SPELLS.PYROBLAST.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 10,
      },
      // Rotational AOE
      {
        spell: [SPELLS.ARCANE_EXPLOSION.id, ...SPELLS.ARCANE_EXPLOSION.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CONE_OF_COLD.id, ...SPELLS.CONE_OF_COLD.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLIZZARD.id, ...SPELLS.BLIZZARD.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FLAMESTRIKE.id, ...SPELLS.FLAMESTRIKE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DRAGONS_BREATH.id, ...SPELLS.DRAGONS_BREATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 20,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 40,
      },
      {
        spell: [SPELLS.LIVING_BOMB.id, ...SPELLS.LIVING_BOMB.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 50,
      },
      // Cooldowns
      {
        spell: [SPELLS.ARCANE_POWER.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        enabled: combatant.talentPoints[0] >= 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.ICY_VEINS.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        enabled: combatant.talentPoints[2] >= 10,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.PRESENCE_OF_MIND.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        enabled: combatant.talentPoints[0] >= 20,
      },
      {
        spell: [SPELLS.MIRROR_IMAGE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EVOCATION.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 240,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLAST_WAVE.id, ...SPELLS.BLAST_WAVE.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[1] >= 20,
      },
      {
        spell: [SPELLS.COLD_SNAP.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 480,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 20,
      },
      {
        spell: [SPELLS.DEEP_FREEZE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 50,
      },
      {
        spell: [SPELLS.SUMMON_WATER_ELEMENTAL.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 40,
      },
      {
        spell: [SPELLS.FIRE_BLAST.id, ...SPELLS.FIRE_BLAST.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 8,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: [SPELLS.MANA_SHIELD.id, ...SPELLS.MANA_SHIELD.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICE_BLOCK.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FROST_NOVA.id, ...SPELLS.FROST_NOVA.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.INVISIBILITY.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICE_BARRIER.id, ...SPELLS.ICE_BARRIER.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        enabled: combatant.talentPoints[2] >= 30,
      },
      {
        spell: [SPELLS.FROST_WARD.id, ...SPELLS.FROST_WARD.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FIRE_WARD.id, ...SPELLS.FIRE_WARD.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.SPELLSTEAL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLINK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REMOVE_CURSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.COUNTERSPELL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Consumable
      {
        spell: [SPELLS.REPLENISH_MANA.id],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: null,
        cooldown: 120,
      },
    ];
  }
}

export default Abilities;

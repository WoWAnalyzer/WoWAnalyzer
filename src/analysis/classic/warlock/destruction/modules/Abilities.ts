import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // LIST ALL SPELLS THAT COULD BE CAST DURING COMBAT BY THIS SPEC
      // Rotational
      {
        spell: SPELLS.INCINERATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.IMMOLATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SOUL_FIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BANE_OF_DOOM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CORRUPTION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CONFLAGRATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 8, // Glyph of Conflagrate reduces the cooldown by 2s
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CHAOS_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SHADOWBURN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BANE_OF_AGONY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FEL_FLAME.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.SHADOWFLAME.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 12,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.RAIN_OF_FIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },

      // Cooldowns
      {
        spell: SPELLS.DEMON_SOUL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        buffSpellIds: [SPELLS.DEMON_SOUL_IMP_BUFF.id],
      },
      {
        spell: SPELLS.SUMMON_DOOMGUARD.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 600,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: SPELLS.MORTAL_COIL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 120,
      },
      {
        spell: SPELLS.NETHER_WARD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
      },

      // Other spells (not apart of the normal rotation)

      // Utility
      {
        spell: SPELLS.LIFE_TAP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BANE_OF_HAVOC.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CURSE_OF_THE_ELEMENTS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SOULBURN.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
      },
      {
        spell: SPELLS.SHADOWFURY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_SUMMON.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TELEPORT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
      },

      // Pet Related
      {
        spell: SPELLS.SUMMON_IMP.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SUMMON_FELHUNTER.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SUMMON_VOIDWALKER.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SUMMON_SUCCUBUS.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },

      // Consumable
    ];
  }
}

export default Abilities;

import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.RUNE_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEATH_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEART_STRIKE.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL,
      },
      {
        spell: SPELLS.BLOOD_BOIL.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL,
      },
      {
        spell: SPELLS.HORN_OF_WINTER.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
      },
      {
        spell: SPELLS.ICY_TOUCH.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL,
      },
      // Rotational AOE
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
      },
      // Cooldowns

      {
        spell: SPELLS.DANCING_RUNE_WEAPON.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: SPELLS.BLOOD_TAP.id,
        gcd: null,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30, // base 60s, but 2/2 Improved Blood Tap makes it 30s
      },
      {
        spell: SPELLS.BONE_SHIELD.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
      },
      {
        spell: SPELLS.OUTBREAK.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30, // Blood has a passive that reduces the CD to 30s
      },
      {
        spell: SPELLS.EMPOWER_RUNE_WEAPON.id,
        gcd: null,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 300,
      },
      {
        spell: SPELLS.PLAGUE_STRIKE.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.ROTATIONAL,
      },

      // Defensive
      {
        spell: SPELLS.VAMPIRIC_BLOOD.id,
        gcd: null,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        gcd: null,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 45,
      },
      {
        spell: SPELLS.ICEBOUND_FORTITUDE.id,
        gcd: null,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.RUNE_TAP.id,
        gcd: null,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 0, // 3/3 Improved Rune Tap makes this a 0s cooldown, but it costs a rune still
      },
      {
        spell: SPELLS.DEATH_PACT.id,
        gcd: null,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
      },

      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.DARK_COMMAND.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 8,
      },
      {
        spell: SPELLS.PESTILENCE.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.DEATH_COIL_DK.id,
        gcd: { base: 1500 },
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.DARK_SIMULACRUM.id,
        gcd: null,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 60,
      },
      {
        spell: SPELLS.FROST_PRESENCE.id,
        gcd: null,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.UNHOLY_PRESENCE.id,
        gcd: null,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.BLOOD_PRESENCE.id,
        gcd: null,
        category: SPELL_CATEGORY.OTHERS,
      },

      // Utility
      {
        spell: SPELLS.DEATH_GRIP.id,
        gcd: null,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25, // 2/2 Unholy Command reduces it to 25s
      },
      {
        spell: SPELLS.MIND_FREEZE.id,
        gcd: null,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
      },

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;

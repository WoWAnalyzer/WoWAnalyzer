import SPELLS from 'common/SPELLS/classic/deathknight';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.OBLITERATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FROST_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BLOOD_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.ICY_TOUCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.PLAGUE_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RUNE_STRIKE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.DEATH_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.HOWLING_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PESTILENCE.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BLOOD_BOIL.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.UNBREAKABLE_ARMOR.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: [SPELLS.EMPOWER_RUNE_WEAPON.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: [SPELLS.ARMY_OF_THE_DEAD.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 600,
      },
      {
        spell: [SPELLS.BLOOD_TAP.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: [SPELLS.RAISE_DEAD.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      // Defensive
      {
        spell: [SPELLS.ANTI_MAGIC_SHELL.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.ICEBOUND_FORTITUDE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: [SPELLS.MIND_FREEZE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.DEATH_COIL_DK.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.CHAINS_OF_ICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DARK_COMMAND.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.DEATH_GRIP.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.HORN_OF_WINTER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STRANGULATE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLOOD_PRESENCE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.FROST_PRESENCE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.UNHOLY_PRESENCE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;

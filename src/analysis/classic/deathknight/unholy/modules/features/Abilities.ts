import SPELLS from 'common/SPELLS/classic/deathknight';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.DEATH_COIL_DK.id,
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
        spell: SPELLS.BLOOD_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.GHOUL_FRENZY.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SCOURGE_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.BLOOD_BOIL.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PESTILENCE.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CORPSE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.SUMMON_GARGOYLE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.BLOOD_TAP.id],
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
      // Defensive
      {
        spell: [SPELLS.ANTI_MAGIC_SHELL.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.FROST_PRESENCE.id],
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
        spell: [SPELLS.RAISE_DEAD.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.BLOOD_PRESENCE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.BONE_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
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
        spell: SPELLS.DEATH_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HORN_OF_WINTER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RAISE_ALLY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STRANGULATE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
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

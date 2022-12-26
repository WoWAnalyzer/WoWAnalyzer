import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: [SPELLS.DEATH_COIL_DK.id, ...SPELLS.DEATH_COIL_DK.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ICY_TOUCH.id, ...SPELLS.ICY_TOUCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PLAGUE_STRIKE.id, ...SPELLS.PLAGUE_STRIKE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLOOD_STRIKE.id, ...SPELLS.BLOOD_STRIKE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.GHOUL_FRENZY.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SCOURGE_STRIKE.id, ...SPELLS.SCOURGE_STRIKE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.DEATH_AND_DECAY.id, ...SPELLS.DEATH_AND_DECAY.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLOOD_BOIL.id, ...SPELLS.BLOOD_BOIL.lowRanks],
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
        spell: [SPELLS.FROST_PRESENCE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
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
        spell: [SPELLS.HORN_OF_WINTER.id, ...SPELLS.HORN_OF_WINTER.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;

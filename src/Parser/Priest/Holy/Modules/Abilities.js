import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // HW:Sanc and HW:Serenity not included due to Serendipity causing an odd situation with their CDs
      {
        spell: SPELLS.PRAYER_OF_MENDING_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DESPERATE_PRAYER,
        buffSpellId: SPELLS.DESPERATE_PRAYER.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90, // todo: Account for Angel's Mercy if possible
      },
      {
        spell: SPELLS.APOTHEOSIS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_HYMN_CAST,
        buffSpellId: SPELLS.DIVINE_HYMN_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SYMBOL_OF_HOPE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SALVATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 720, // reduced by Sanctify and Serenity
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SANCTIFY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by PoH and Renew
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SERENITY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by Heal and Flash Heal
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_STAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HALO_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.HALO_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CIRCLE_OF_HEALING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RENEW,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PRAYER_OF_HEALING,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.GREATER_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLASH_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BINDING_HEAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HOLY_FIRE,
        buffSpellId: SPELLS.HOLY_FIRE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 10, // can be reset by Holy Nova
        isOnGCD: true,
      },
      {
        spell: SPELLS.HOLY_NOVA,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HOLY_WORD_CHASTICE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 60, // gets reduced by Smite
        isOnGCD: true,
      },
      {
        spell: SPELLS.SMITE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.GUARDIAN_SPIRIT,
        buffSpellId: SPELLS.GUARDIAN_SPIRIT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180, // guardian angel talent can reduce this
      },
      {
        spell: SPELLS.LEAP_OF_FAITH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PURIFY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8, // give it the rshaman dispel treatment
        isOnGCD: true,
      },
      {
        spell: SPELLS.ANGELIC_FEATHER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 3,
        cooldown: 20,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHINING_FORCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

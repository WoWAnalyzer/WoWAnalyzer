import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/shared/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.PRAYER_OF_MENDING_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        buffSpellId: SPELLS.PRAYER_OF_MENDING_BUFF.id,
        healSpellId: [
          SPELLS.PRAYER_OF_MENDING_HEAL.id,
        ],
      },
      {
        spell: SPELLS.DESPERATE_PRAYER,
        buffSpellId: SPELLS.DESPERATE_PRAYER.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90, // todo: Account for Angel's Mercy if possible
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.APOTHEOSIS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_HYMN_CAST,
        buffSpellId: SPELLS.DIVINE_HYMN_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        healSpellId: [
          SPELLS.DIVINE_HYMN_HEAL.id,
        ],
      },
      {
        spell: SPELLS.SYMBOL_OF_HOPE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SALVATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 720, // reduced by Sanctify and Serenity
        enabled: combatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SANCTIFY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by PoH and Renew
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SERENITY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by Heal and Flash Heal
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_STAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        healSpellId: [
          SPELLS.DIVINE_STAR_HEAL.id,
        ],
      },
      {
        spell: SPELLS.HALO_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.HALO_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        healSpellId: [
          SPELLS.HALO_HEAL.id,
        ],
      },
      {
        spell: SPELLS.CIRCLE_OF_HEALING_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RENEW,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.PRAYER_OF_HEALING,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.GREATER_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.FLASH_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BINDING_HEAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BINDING_HEAL_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        healSpellId: [
          SPELLS.TWIST_MAGIC_HEAL.id,
        ],
      },
      {
        spell: SPELLS.HOLY_FIRE,
        buffSpellId: SPELLS.HOLY_FIRE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        // enabling cooldown breaks a lot of logs timelines where the healer actively DPSed
        // not worth showing until the reset is properly implemented
        // cooldown: 10, // can be reset by Holy Nova and smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOLY_NOVA,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_CHASTISE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 60, // gets reduced by Smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SMITE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GUARDIAN_SPIRIT,
        buffSpellId: SPELLS.GUARDIAN_SPIRIT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180, // guardian angel talent can reduce this
        healSpellId: [
          SPELLS.GUARDIAN_SPIRIT_HEAL.id,
        ],
      },
      {
        spell: SPELLS.LEAP_OF_FAITH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANGELIC_FEATHER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 3,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHINING_FORCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRIT_OF_REDEMPTION_BUFF,
        buffSpellId: SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => this.owner.fightDuration / 1000,
      },
    ];
  }
}

export default Abilities;

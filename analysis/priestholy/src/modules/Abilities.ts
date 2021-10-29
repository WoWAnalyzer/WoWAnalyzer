import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.PRAYER_OF_MENDING_CAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste: number) => 11 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
        buffSpellId: SPELLS.PRAYER_OF_MENDING_BUFF.id,
        healSpellIds: [SPELLS.PRAYER_OF_MENDING_HEAL.id],
      },
      {
        spell: SPELLS.DESPERATE_PRAYER.id,
        buffSpellId: SPELLS.DESPERATE_PRAYER.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90, // todo: Account for Angel's Mercy if possible
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.35,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0,
        },
      },
      {
        spell: SPELLS.APOTHEOSIS_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
          averageIssueEfficiency: 0.1,
          majorIssueEfficiency: 0,
        },
      },
      {
        spell: SPELLS.DIVINE_HYMN_CAST.id,
        buffSpellId: SPELLS.DIVINE_HYMN_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
          averageIssueEfficiency: 0.1,
          majorIssueEfficiency: 0,
        },
        healSpellIds: [SPELLS.DIVINE_HYMN_HEAL.id],
      },
      {
        spell: SPELLS.SYMBOL_OF_HOPE.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01, // This spell should be cast at least one per encounter
          majorIssueEfficiency: 0,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SALVATION_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 720, // reduced by Sanctify and Serenity
        enabled: combatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
          averageIssueEfficiency: 0.1,
          majorIssueEfficiency: 0,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SANCTIFY.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by PoH and Renew
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
      },
      {
        spell: SPELLS.HOLY_WORD_SERENITY.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // reduced by Heal and Flash Heal
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
      },
      {
        spell: SPELLS.DIVINE_STAR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
        healSpellIds: [SPELLS.DIVINE_STAR_HEAL.id],
      },
      {
        spell: SPELLS.HALO_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.HALO_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
        healSpellIds: [SPELLS.HALO_HEAL.id],
      },
      {
        spell: SPELLS.CIRCLE_OF_HEALING_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste: number) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
      },
      {
        spell: SPELLS.RENEW.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PRAYER_OF_HEALING.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GREATER_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLASH_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BINDING_HEAL_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BINDING_HEAL_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISPEL_MAGIC.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOLY_FIRE.id,
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
        spell: SPELLS.HOLY_NOVA.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.HOLY_NOVA_HEAL.id],
      },
      {
        spell: SPELLS.HOLY_WORD_CHASTISE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 60, // gets reduced by Smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SMITE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FADE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GUARDIAN_SPIRIT.id,
        buffSpellId: SPELLS.GUARDIAN_SPIRIT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180, // guardian angel talent can reduce this
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01, // This spell should be cast at least one per encounter
          majorIssueEfficiency: 0,
        },
        healSpellIds: [SPELLS.GUARDIAN_SPIRIT_HEAL.id],
      },
      {
        spell: SPELLS.LEAP_OF_FAITH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ANGELIC_FEATHER_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 3,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHINING_FORCE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id,
        buffSpellId: SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => this.owner.fightDuration / 1000,
      },
      {
        spell: SPELLS.POWER_INFUSION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_WORD_DEATH.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isDefensive: true,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLESHCRAFT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
    ];
  }
}

export default Abilities;

import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES_ID } from '../constants';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES_ID;
  }

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.PRAYER_OF_MENDING_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 12 / (1 + haste),
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
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90 - (combatant.hasTalent(TALENTS.ANGELS_MERCY_TALENT) ? 20 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.35,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0,
        },
      },
      {
        spell: TALENTS.APOTHEOSIS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.APOTHEOSIS_TALENT),
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
        spell: TALENTS.DIVINE_HYMN_TALENT.id,
        buffSpellId: SPELLS.DIVINE_HYMN_HEAL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: TALENTS.SYMBOL_OF_HOPE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        spell: TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(TALENTS.MIRACLE_WORKER_TALENT) ? 2 : 1,
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
        spell: TALENTS.HOLY_WORD_SERENITY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: combatant.hasTalent(TALENTS.MIRACLE_WORKER_TALENT) ? 2 : 1,
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
        spell: TALENTS.DIVINE_STAR_SHARED_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(TALENTS.DIVINE_STAR_SHARED_TALENT),
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
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.HALO_SHARED_TALENT),
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
        spell: TALENTS.RENEW_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PRAYER_OF_HEALING_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GREATER_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLASH_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DISPEL_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOLY_FIRE.id,
        buffSpellId: SPELLS.HOLY_FIRE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        // enabling cooldown breaks a lot of logs timelines where the healer actively DPSed
        // not worth showing until the reset is properly implemented
        // cooldown: 10, // can be reset by Holy Nova and smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HOLY_NOVA_TALENT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.HOLY_NOVA_HEAL.id],
      },
      {
        spell: TALENTS.HOLY_WORD_CHASTISE_TALENT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: 60, // gets reduced by Smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SMITE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FADE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: TALENTS.GUARDIAN_SPIRIT_TALENT.id,
        buffSpellId: TALENTS.GUARDIAN_SPIRIT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
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
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.PSYCHIC_VOICE_TALENT) ? 30 : 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ANGELIC_FEATHER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 3,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS.ANGELIC_FEATHER_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id,
        buffSpellId: SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: () => this.owner.fightDuration / 1000,
      },
      {
        spell: TALENTS.POWER_INFUSION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
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
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: SPELL_CATEGORY.OTHERS,
        isDefensive: true,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;

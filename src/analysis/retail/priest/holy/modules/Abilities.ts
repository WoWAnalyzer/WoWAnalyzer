import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES_ID } from '../constants';
import { FullCombatant } from 'parser/core/Combatant';

import Combatant from 'parser/core/Combatant';
import { L } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES_ID;
  }

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.BENEDICTION.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PRAYER_OF_MENDING_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => {
          let baseCD = 12;
          if (combatant.hasTalent(TALENTS.WASTE_NO_TIME_TALENT)) {
            baseCD -= 1.5;
          }
          return baseCD / (1 + haste);
        },
        charges: combatant.hasTalent(TALENTS.GUIDING_LIGHT_TALENT) ? 2 : 1,
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
        cooldown: combatant.hasTalent(TALENTS.SERAPHIC_CRESCENDO_TALENT) ? 120 : 180,
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
        cooldown: (haste: number) => {
          let baseCD = 60;
          if (combatant.hasTalent(TALENTS.HOLY_CELERITY_TALENT)) {
            baseCD -= 15;
          }
          if (combatant.hasTalent(TALENTS.PROPHETS_INSIGHT_TALENT)) {
            baseCD -= 5;
          }
          return baseCD;
        },
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
        spell: SPELLS.HALO_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.HALO_HOLY_TALENT),
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
        spell: TALENTS.PRAYER_OF_HEALING_TALENT.id,
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
        cooldown: 10, // can be reset by Holy Nova and smite
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HOLY_NOVA_TALENT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: combatant.hasTalent(TALENTS.LIGHTBURST_TALENT) ? 30 : 0,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.HOLY_NOVA_HEAL.id],
      },
      {
        spell: TALENTS.HOLY_WORD_CHASTISE_TALENT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => {
          let baseCD = 60;
          if (combatant.hasTalent(TALENTS.HOLY_CELERITY_TALENT)) {
            baseCD -= 15;
          }
          if (combatant.hasTalent(TALENTS.PROPHETS_INSIGHT_TALENT)) {
            baseCD -= 5;
          }
          return baseCD;
        },
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
        cooldown: (haste: number) => {
          let baseCD = 30;
          if (combatant.hasTalent(TALENTS.IMPROVED_FADE_TALENT)) {
            const rank = combatant.getTalentRank(TALENTS.IMPROVED_FADE_TALENT);
            baseCD -= 5 * rank;
          }
          return baseCD;
        },
        gcd: null,
      },
      {
        spell: TALENTS.GUARDIAN_SPIRIT_TALENT.id,
        buffSpellId: TALENTS.GUARDIAN_SPIRIT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 180,
        duration: (combatant: Combatant) => {
          let baseDuration = 10;
          if (combatant.hasTalent(TALENTS.FORESEEN_CIRCUMSTANCES_TALENT)) {
            baseDuration += 2;
          }
          return baseDuration;
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          majorIssueEfficiency: 0,
        },
        healSpellIds: [SPELLS.GUARDIAN_SPIRIT_HEAL.id],
      },
      {
        spell: SPELLS.LEAP_OF_FAITH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.MOVE_WITH_GRACE_TALENT) ? 60 : 90,
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
        cooldown: combatant.hasTalent(TALENTS.PSYCHIC_VOICE_TALENT) ? 30 : 40,
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
        cooldown: (haste: number) => {
          // If player has Twins talent, return 0 so SpellUsable doesn't auto-start cooldown.
          // Otherwise, normal 120s cooldown.
          if (combatant.hasTalent(TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT)) {
            return 0;
          }
          return 120;
        },
        // Override max casts to always use 120s cooldown for efficiency calculation
        maxCasts: (fightDuration: number) => Math.ceil(fightDuration / 120000),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.4,
        },
        enabled: combatant.hasTalent(TALENTS.POWER_INFUSION_TALENT),
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 5,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SHADOW_WORD_DEATH_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;

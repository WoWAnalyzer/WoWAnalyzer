import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import CoreAbilities from '@wowanalyzer/druid/src/core/Abilities';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.TRANQUILITY_CAST.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.3,
        },
        healSpellIds: [SPELLS.TRANQUILITY_HEAL.id],
      },
      {
        spell: SPELLS.NATURES_SWIFTNESS.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60, //TODO include conduit reduction
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.INNERVATE.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.IRONBARK.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.BARKSKIN.id,
        buffSpellId: SPELLS.BARKSKIN.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.CENARION_WARD_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        healSpellIds: [SPELLS.CENARION_WARD_HEAL.id],
      },
      {
        spell: SPELLS.FLOURISH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FLOURISH_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EFFLORESCENCE_CAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.EFFLORESCENCE_HEAL.id, SPELLS.SPRING_BLOSSOMS.id],
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.REJUVENATION_GERMINATION.id, SPELLS.CULTIVATION.id],
      },
      {
        spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
        cooldown: 180,
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
        spell: SPELLS.REGROWTH.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4,
          averageIssueEfficiency: 0.1,
          importance: ISSUE_IMPORTANCE.REGULAR,
        },
      },
      {
        spell: SPELLS.RENEWAL_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: !combatant.hasLegendary(SPELLS.THE_DARK_TITANS_LESSON),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasLegendary(SPELLS.THE_DARK_TITANS_LESSON),
        gcd: {
          base: 1500,
        },
        healSpellIds: [SPELLS.LIFEBLOOM_BLOOM_HEAL.id],
      },
      {
        spell: SPELLS.NATURES_CURE.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REBIRTH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOOTHE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GROWL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      //Damage Dealing
      {
        spell: SPELLS.WRATH.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONFIRE_CAST.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUNFIRE_CAST.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: (haste: number) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHRED.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: 1000,
        },
      },
      //Forms
      {
        spell: SPELLS.STAG_FORM.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BEAR_FORM.id,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAT_FORM.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },
      //Guardian Affinity
      {
        spell: SPELLS.THRASH_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THRASH_FERAL.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.IRONFUR.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 0.5,
      },

      //Feral Affinity
      {
        spell: SPELLS.SWIPE_CAT.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RIP.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RAKE.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          static: 1000,
        },
      },

      //Balance Affinity
      {
        spell: SPELLS.STARSURGE_AFFINITY.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARFIRE_AFFINITY.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: SPELLS.WILD_CHARGE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_CAT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_MOONKIN.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.DASH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 120,
        gcd: {
          static: combatant.hasBuff(SPELLS.CAT_FORM.id) ? 0 : 1500,
        },
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 45,
        gcd: {
          static: combatant.hasBuff(SPELLS.CAT_FORM.id) ? 0 : 1500,
        },
      },

      //CC
      {
        spell: SPELLS.HIBERNATE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TYPHOON.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 50,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
      },
      {
        spell: SPELLS.URSOLS_VORTEX.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      },
      {
        spell: SPELLS.OVERGROWTH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.OVERGROWTH_TALENT.id),
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

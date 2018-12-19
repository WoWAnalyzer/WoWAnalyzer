import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.TRANQUILITY_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (_, combatant) => combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          averageIssueEfficiency: 0.55,
          majorIssueEfficiency: 0.30,
        },
        healSpellIds: [
          SPELLS.TRANQUILITY_HEAL.id,
        ],
      },
      {
        spell: SPELLS.INNERVATE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.IRONBARK,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (_, combatant) => {
          let cd = 60;
          if (combatant.hasTalent(SPELLS.STONEBARK_TALENT.id)) {
            cd -= 15;
          }
          if (combatant.hasHands(ITEMS.XONIS_CARESS.id)) {
            cd *= 0.80;
          }
          return cd;
        },
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.BARKSKIN,
        buffSpellId: SPELLS.BARKSKIN.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.CENARION_WARD_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        healSpellIds: [
          SPELLS.CENARION_WARD_HEAL.id,
        ],
      },
      {
        spell: SPELLS.FLOURISH_TALENT,
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
          majorIssueEfficiency: 0.30,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EFFLORESCENCE_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        healSpellIds: [
          SPELLS.EFFLORESCENCE_HEAL.id,
          SPELLS.SPRING_BLOSSOMS.id,
        ],
      },
      {
        spell: SPELLS.REJUVENATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [
          SPELLS.REJUVENATION_GERMINATION.id,
          SPELLS.AUTUMN_LEAVES.id,
          SPELLS.CULTIVATION.id,
          // TODO - Add part of ysera's gift to be included if you have azerite trait waking dream
        ],
      },
      {
        spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80,
          averageIssueEfficiency: 0.60,
          majorIssueEfficiency: 0.40,
        },
      },
      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIFTMEND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 22 : 25,
        charges: combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.40,
          averageIssueEfficiency: 0.00, // average and "negative" major included for checklist bar scaling in line with a "minor" issue
          majorIssueEfficiency: -1,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        healSpellIds: [
          SPELLS.GROVE_TENDING.id,
        ],
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        healSpellIds: [
          SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
        ],
      },
      {
        spell: SPELLS.NATURES_CURE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOOTHE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GROWL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      //Damage Dealing
      {
        spell: SPELLS.SOLAR_WRATH,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONFIRE,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUNFIRE_CAST,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MANGLE_BEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: haste => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHRED,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1000,
        },
      },
      //Forms
      {
        spell: SPELLS.STAG_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BEAR_FORM,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.CAT_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },
      //Guardian Affinity
      {
        spell: SPELLS.THRASH_BEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THRASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.IRONFUR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
        cooldown: 0.5,
      },

      //Feral Affinity
      {
        spell: SPELLS.SWIPE_CAT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RIP,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.RAKE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1000,
        },
      },

      //Balance Affinity
      {
        spell: SPELLS.STARSURGE_AFFINITY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LUNAR_STRIKE_AFFINITY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_RESTORATION.id),
        gcd: {
          base: 1500,
        },
      },

      //Movement
      {
        spell: SPELLS.WILD_CHARGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_BEAR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_CAT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.WILD_CHARGE_MOONKIN,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.DASH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },

      //CC
      {
        spell: SPELLS.HIBERNATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TYPHOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.TYPHOON.id),
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 50,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
      },
      {
        spell: SPELLS.URSOLS_VORTEX,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      },
    ];
  }
}

export default Abilities;

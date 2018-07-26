import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

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
      },
      {
        spell: SPELLS.INNERVATE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
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
      },
      {
        spell: SPELLS.REJUVENATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
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
        cooldown: (haste, combatant) => combatant.hasTalent(SPELLS.PROSPERITY_TALENT.id) ? 27 : 30,
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
        spell: SPELLS.BEAR_FORM,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAT_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DASH,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAKE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      },
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
        spell: SPELLS.RIP,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHRED,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAT_SWIPE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.URSOLS_VORTEX,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 50,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
      },
      {
        spell: SPELLS.TYPHOON,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.TYPHOON.id),
      },
      {
        spell: SPELLS.MOONKIN_FORM,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARSURGE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.NATURES_CURE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;

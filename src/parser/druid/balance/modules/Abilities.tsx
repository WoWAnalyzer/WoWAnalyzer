import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'parser/core/modules/Abilities';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.STARSURGE_MOONKIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.STARFALL_CAST,
        buffSpellId: SPELLS.STARFALL_CAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SOLAR_WRATH_MOONKIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.LUNAR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.MOONFIRE,
        buffSpellId: SPELLS.MOONFIRE_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SUNFIRE_CAST,
        buffSpellId: SPELLS.SUNFIRE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.STELLAR_FLARE_TALENT,
        buffSpellId: SPELLS.STELLAR_FLARE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 8,
      },

      // Cooldowns
      {
        spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
        buffSpellId: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.CELESTIAL_ALIGNMENT,
        buffSpellId: SPELLS.CELESTIAL_ALIGNMENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.WARRIOR_OF_ELUNE_TALENT,
        buffSpellId: SPELLS.WARRIOR_OF_ELUNE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 48,
        enabled: combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.FORCE_OF_NATURE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.FORCE_OF_NATURE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 10,
      },
      {
        spell: [SPELLS.NEW_MOON_TALENT, SPELLS.HALF_MOON, SPELLS.FULL_MOON],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.NEW_MOON_TALENT.id),
        gcd: {
          base: 1500,
        },
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          averageIssueEfficiency: 0.9,
          majorIssueEfficiency: 0.85,
          extraSuggestion: (
            <>
              Your <SpellLink id={SPELLS.NEW_MOON_TALENT.id} />, <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.
            </>
          ),
        },
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.FURY_OF_ELUNE_TALENT,
        buffSpellId: SPELLS.FURY_OF_ELUNE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.FURY_OF_ELUNE_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 11,
      },

      //Utility
      {
        spell: SPELLS.INNERVATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.70,
          averageIssueEfficiency: 0.50,
          majorIssueEfficiency: 0.30,
        },
        timelineSortIndex: 12,
      },
      {
        spell: SPELLS.BARKSKIN,
        buffSpellId: SPELLS.BARKSKIN.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.50,
          averageIssueEfficiency: 0.35,
          majorIssueEfficiency: 0.25,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 13,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT,
        buffSpellId: SPELLS.TIGER_DASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 14,
      },
      {
        spell: [SPELLS.WILD_CHARGE_TALENT, SPELLS.WILD_CHARGE_MOONKIN, SPELLS.WILD_CHARGE_CAT, SPELLS.WILD_CHARGE_BEAR, SPELLS.WILD_CHARGE_TRAVEL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 50,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
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
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DASH,
        buffSpellId: SPELLS.DASH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOLAR_BEAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
      },
      {
        spell: SPELLS.REMOVE_CORRUPTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        spell: SPELLS.GROWL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
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
        buffSpellId: SPELLS.CAT_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM,
        buffSpellId: SPELLS.MOONKIN_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        buffSpellId: SPELLS.TRAVEL_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        buffSpellId: SPELLS.FRENZIED_REGENERATION.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 36,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
      },
      {
        spell: SPELLS.SWIFTMEND,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REJUVENATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HIBERNATE,
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
    ];
  }
}

export default Abilities;

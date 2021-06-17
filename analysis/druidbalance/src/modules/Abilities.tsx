import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import React from 'react';

import CoreAbilities from '@wowanalyzer/druid/src/core/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.STARSURGE_MOONKIN.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.STARFALL_CAST.id,
        buffSpellId: SPELLS.STARFALL_CAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.WRATH_MOONKIN.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.STARFIRE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.MOONFIRE.id,
        buffSpellId: SPELLS.MOONFIRE_BEAR.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SUNFIRE_CAST.id,
        buffSpellId: SPELLS.SUNFIRE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.STELLAR_FLARE_TALENT.id,
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
        spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id,
        buffSpellId: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.CELESTIAL_ALIGNMENT.id,
        buffSpellId: SPELLS.CELESTIAL_ALIGNMENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.WARRIOR_OF_ELUNE_TALENT.id,
        buffSpellId: SPELLS.WARRIOR_OF_ELUNE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.FORCE_OF_NATURE_TALENT.id,
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
        spell: [SPELLS.NEW_MOON_TALENT.id, SPELLS.HALF_MOON, SPELLS.FULL_MOON.id],
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
              Your <SpellLink id={SPELLS.NEW_MOON_TALENT.id} />,{' '}
              <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast
              efficiency can be improved, try keeping yourself at low Moon charges at all times; you
              should (almost) never be at max (3) charges.
            </>
          ),
        },
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.FURY_OF_ELUNE_TALENT.id,
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
        spell: SPELLS.INNERVATE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
          averageIssueEfficiency: 0.5,
          majorIssueEfficiency: 0.3,
        },
        timelineSortIndex: 12,
      },
      {
        spell: SPELLS.BARKSKIN.id,
        buffSpellId: SPELLS.BARKSKIN.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          averageIssueEfficiency: 0.35,
          majorIssueEfficiency: 0.25,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 13,
      },
      {
        spell: SPELLS.RENEWAL_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT.id,
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
        spell: [
          SPELLS.WILD_CHARGE_TALENT.id,
          SPELLS.WILD_CHARGE_MOONKIN.id,
          SPELLS.WILD_CHARGE_CAT.id,
          SPELLS.WILD_CHARGE_BEAR.id,
          SPELLS.WILD_CHARGE_TRAVEL.id,
        ],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
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
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DASH.id,
        buffSpellId: SPELLS.DASH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOLAR_BEAM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.REMOVE_CORRUPTION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        spell: SPELLS.GROWL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
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
        buffSpellId: SPELLS.CAT_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM.id,
        buffSpellId: SPELLS.MOONKIN_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM.id,
        buffSpellId: SPELLS.TRAVEL_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        buffSpellId: SPELLS.FRENZIED_REGENERATION.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 36,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HIBERNATE.id,
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
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

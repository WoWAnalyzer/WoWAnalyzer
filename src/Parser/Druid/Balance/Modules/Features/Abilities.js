import React from 'react';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational Spells
      {
        spell: [SPELLS.NEW_MOON, SPELLS.HALF_MOON, SPELLS.FULL_MOON],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 15,
        isOnGCD: true,
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          averageIssueEfficiency: 0.9,
          majorIssueEfficiency: 0.85,
          extraSuggestion: (
            <Wrapper>
              Your <SpellLink id={SPELLS.NEW_MOON.id} />, <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.
            </Wrapper>
          ),
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.STARSURGE_MOONKIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.STARFALL_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SOLAR_WRATH_MOONKIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.LUNAR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.MOONFIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SUNFIRE_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.STELLAR_FLARE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id),
        isOnGCD: true,
        timelineSortIndex: 8,
      },

      // Cooldowns
      {
        spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.CELESTIAL_ALIGNMENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.WARRIOR_OF_ELUNE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 48,
        enabled: combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.FORCE_OF_NATURE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.FORCE_OF_NATURE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.ASTRAL_COMMUNION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 80,
        enabled: combatant.hasTalent(SPELLS.ASTRAL_COMMUNION_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
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
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
        timelineSortIndex: 13,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.DISPLACER_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.DISPLACER_BEAST_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.WILD_CHARGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 50,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.TYPHOON_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DASH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        isOnGCD: true, //It is not on the GCD if already in catform. Pretty low prio to fix since you can't cast anything meaning full in catform anyway.
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
        isOnGCD: true,
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.GROWL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.BEAR_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CAT_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MOONKIN_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
      },
      {
        spell: SPELLS.SWIFTMEND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.REJUVENATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.SWIFTMEND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

import CoreAbilities from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.STARSURGE_MOONKIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.STARFALL_CAST.id,
        buffSpellId: SPELLS.STARFALL_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.WRATH_MOONKIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.STARFIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.MOONFIRE_CAST.id,
        buffSpellId: SPELLS.MOONFIRE_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SUNFIRE_CAST.id,
        buffSpellId: SPELLS.SUNFIRE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
      },
      {
        spell: TALENTS_DRUID.STELLAR_FLARE_BALANCE_TALENT.id,
        buffSpellId: TALENTS_DRUID.STELLAR_FLARE_BALANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_BALANCE_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 8,
      },

      // Cooldowns
      {
        spell: TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_BALANCE_TALENT.id,
        buffSpellId: TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_BALANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_BALANCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.CELESTIAL_ALIGNMENT.id,
        buffSpellId: SPELLS.CELESTIAL_ALIGNMENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_BALANCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS_DRUID.WARRIOR_OF_ELUNE_BALANCE_TALENT.id,
        buffSpellId: TALENTS_DRUID.WARRIOR_OF_ELUNE_BALANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS_DRUID.WARRIOR_OF_ELUNE_BALANCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS_DRUID.FORCE_OF_NATURE_BALANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_BALANCE_TALENT.id),
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
        spell: [TALENTS_DRUID.NEW_MOON_BALANCE_TALENT.id, SPELLS.HALF_MOON.id, SPELLS.FULL_MOON.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS_DRUID.NEW_MOON_BALANCE_TALENT.id),
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
              Your <SpellLink id={TALENTS_DRUID.NEW_MOON_BALANCE_TALENT.id} />,{' '}
              <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast
              efficiency can be improved, try keeping yourself at low Moon charges at all times; you
              should (almost) never be at max (3) charges.
            </>
          ),
        },
        timelineSortIndex: 11,
      },
      {
        spell: TALENTS_DRUID.FURY_OF_ELUNE_BALANCE_TALENT.id,
        buffSpellId: TALENTS_DRUID.FURY_OF_ELUNE_BALANCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_BALANCE_TALENT.id),
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
        category: SPELL_CATEGORY.UTILITY,
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
        category: SPELL_CATEGORY.DEFENSIVE,
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
        spell: TALENTS_DRUID.RENEWAL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS_DRUID.RENEWAL_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: TALENTS_DRUID.TIGER_DASH_TALENT.id,
        buffSpellId: TALENTS_DRUID.TIGER_DASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT.id),
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
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        timelineSortIndex: 14,
      },
      {
        spell: TALENTS_DRUID.MIGHTY_BASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS_DRUID.MIGHTY_BASH_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_DRUID.MASS_ENTANGLEMENT_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TYPHOON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DASH.id,
        buffSpellId: SPELLS.DASH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT.id),
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOLAR_BEAM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.REMOVE_CORRUPTION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REBIRTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GROWL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.BEAR_FORM.id,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAT_FORM.id,
        buffSpellId: SPELLS.CAT_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM.id,
        buffSpellId: SPELLS.MOONKIN_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRAVEL_FORM.id,
        buffSpellId: SPELLS.TRAVEL_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        buffSpellId: SPELLS.FRENZIED_REGENERATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 36,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT.id),
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS_DRUID.SWIFTMEND_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.REJUVENATION_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_GROWTH_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HIBERNATE.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.HIBERNATE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.SOOTHE_TALENT),
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

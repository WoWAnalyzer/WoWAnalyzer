import CoreAbilities from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import { hastedCooldown, normalGcd } from 'common/abilitiesConstants';

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
        spell: TALENTS_DRUID.STELLAR_FLARE_TALENT.id,
        buffSpellId: TALENTS_DRUID.STELLAR_FLARE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 8,
      },

      // Cooldowns
      {
        spell: cdSpell(combatant).id,
        buffSpellId: SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT) ? 120 : 180,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        gcd: combatant.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT) ? { base: 1500 } : null,
        timelineSortIndex: 9,
      },
      {
        spell: cdSpell(combatant).id,
        buffSpellId: SPELLS.CELESTIAL_ALIGNMENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT) ? 120 : 180,
        enabled:
          combatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) &&
          !combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        gcd: combatant.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT) ? { base: 1500 } : null,
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id,
        buffSpellId: TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 - combatant.getTalentRank(TALENTS_DRUID.EARLY_SPRING_TALENT) * 15,
        enabled: combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT),
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
        spell: [TALENTS_DRUID.NEW_MOON_TALENT.id, SPELLS.HALF_MOON.id, SPELLS.FULL_MOON.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS_DRUID.NEW_MOON_TALENT),
        gcd: {
          base: 1500,
        },
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.7,
          extraSuggestion: (
            <>
              Your <SpellLink spell={TALENTS_DRUID.NEW_MOON_TALENT} />,{' '}
              <SpellLink spell={TALENTS_DRUID.NEW_MOON_TALENT} /> and{' '}
              <SpellLink spell={SPELLS.FULL_MOON} /> cast efficiency can be improved, try keeping
              yourself at low Moon charges at all times; you should (almost) never be at max (3)
              charges.
            </>
          ),
        },
        timelineSortIndex: 11,
      },
      {
        spell: TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id,
        buffSpellId: TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.RADIANT_MOONLIGHT_TALENT) ? 45 : 60,
        enabled: combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.7,
        },
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.CONVOKE_SPIRITS.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.ELUNES_GUIDANCE_TALENT) ? 60 : 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_DRUID.WILD_MUSHROOM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        charges: 3,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_MUSHROOM_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.75,
          majorIssueEfficiency: 0.6,
        },
        timelineSortIndex: 11,
      },

      //Utility
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: hastedCooldown(36),
        gcd: normalGcd,
        isDefensive: true,
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
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_CHARGE_TALENT),
        timelineSortIndex: 14,
      },
      {
        spell: SPELLS.SOLAR_BEAM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.REJUVENATION_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_GROWTH_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MOONKIN_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

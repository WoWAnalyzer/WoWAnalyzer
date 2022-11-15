import CoreAbilities, { druidGcd } from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.SHRED.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 1,
        primaryCoefficient: 0.380562,
      },
      {
        spell: SPELLS.RAKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 2,
        primaryCoefficient: 0.1822, // initial damage, not DoT damage
      },
      {
        spell: SPELLS.RIP.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 5,
        primaryCoefficient: 0.125, // damage per tick
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.MOONFIRE_FERAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id),
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 3,
        primaryCoefficient: 0.15, // initial damage, not DoT damage
      },

      {
        spell: SPELLS.THRASH_FERAL.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 10,
        primaryCoefficient: 0.055, // initial damage, not DoT damage
      },
      {
        spell: TALENTS_DRUID.PRIMAL_WRATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT.id),
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.SWIPE_CAT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT.id),
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 11,
        primaryCoefficient: 0.25,
      },
      {
        spell: TALENTS_DRUID.BRUTAL_SLASH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL, // when taken, still used on single target
        enabled: combatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT.id),
        cooldown: (haste: number) => 8 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.7,
        },
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 11,
        primaryCoefficient: 0.69,
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 11,
        primaryCoefficient: 0.3,
      },

      {
        spell: TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.6,
        },
        // likely a Blizzard bug, probably intended to match Berserk's 1000 fixed
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 22,
      },
      {
        spell: SPELLS.BERSERK.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.6,
        },
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 22,
      },
      {
        spell: TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_DRUID.ASHAMANES_GUIDANCE_TALENT) ? 60 : 120,
        gcd: {
          base: druidGcd,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.TIGERS_FURY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.6,
        },
        gcd: null,
        timelineSortIndex: 20,
      },
      {
        spell: TALENTS_DRUID.FERAL_FRENZY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT.id),
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.6,
        },
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 21,
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: druidGcd,
        },
        timelineSortIndex: 30,
      },
      {
        spell: [SPELLS.PROWL.id, SPELLS.PROWL_INCARNATION.id],
        category: SPELL_CATEGORY.UTILITY,
        // 6 second cooldown, but triggered by leaving stealth not by using Prowl.
        gcd: null,
        timelineSortIndex: 25,
      },
      {
        spell: SPELLS.SHADOWMELD.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        isUndetectable: true,
        gcd: null,
        timelineSortIndex: 24,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        charges: 2,
        gcd: null,
        isDefensive: true,
        timelineSortIndex: 40,
      },
      {
        spell: [
          SPELLS.WILD_CHARGE_TALENT.id, // TODO rename ? Is this the caster form version?
          SPELLS.WILD_CHARGE_MOONKIN.id,
          SPELLS.WILD_CHARGE_CAT.id,
          SPELLS.WILD_CHARGE_BEAR.id,
          SPELLS.WILD_CHARGE_TRAVEL.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        gcd: null,
        timelineSortIndex: 42,
      },
      {
        spell: SPELLS.MOONKIN_FORM_AFFINITY.id, // with no affinity any more, is this correct?
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.MOONKIN_FORM_SHARED_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 54,
      },
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: (haste: number) => 6 / (1 + haste),
      },
      {
        spell: SPELLS.THRASH_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: (haste: number) => 6 / (1 + haste),
      },
      {
        // Moonfire from caster, bear, and moonkin forms. See MOONFIRE_FERAL for cat
        spell: SPELLS.MOONFIRE_CAST.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        // cannot be cast when player is in combat
        spell: SPELLS.REVIVE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARFIRE_AFFINITY.id, // TODO still this ID with no more affinity?
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARFIRE_SHARED_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WRATH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARSURGE_AFFINITY.id, // TODO still this ID with no more affinity?
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.STARSURGE_SHARED_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
      },
      {
        spell: SPELLS.SUNFIRE_AFFINITY.id, // TODO still this ID with no more affinity?
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_DRUID.SUNFIRE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLAP.id,
        category: SPELL_CATEGORY.UTILITY,
        // only usable in Moonkin form so need Balance affinity, also need to learn from a tome
        enabled: combatant.hasTalent(TALENTS_DRUID.MOONKIN_FORM_SHARED_TALENT),
        gcd: {
          static: 500,
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
        spell: SPELLS.SWIFTMEND.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.SWIFTMEND_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_GROWTH_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 20,
      },
      {
        // learnt from a tome
        spell: SPELLS.TREANT_FORM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          static: 1500,
        },
      },
      {
        // learnt from a tome
        spell: SPELLS.CHARM_WOODLAND_CREATURE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
      },
      {
        // replaced by Dreamwalk early on in the Legion class hall quest line
        spell: SPELLS.TELEPORT_MOONGLADE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        // reward from early in the Legion class hall quest line
        spell: SPELLS.TELEPORT_DREAMWALK.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

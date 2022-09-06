import CoreAbilities from 'analysis/retail/druid/core/Abilities';
import SPELLS from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
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
        spell: SPELLS.SAVAGE_ROAR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id),
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.MOONFIRE_FERAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id),
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
        spell: SPELLS.PRIMAL_WRATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(SPELLS.PRIMAL_WRATH_TALENT.id),
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.SWIPE_CAT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 11,
        primaryCoefficient: 0.25,
      },
      {
        spell: SPELLS.BRUTAL_SLASH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL, // when taken, still used on single target
        enabled: combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        cooldown: (haste) => 8 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
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
        enabled: !combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 11,
        primaryCoefficient: 0.3,
      },

      {
        spell: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
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
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 22,
      },
      {
        spell: SPELLS.TIGERS_FURY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          // Predator may reset the cooldown very frequently, more often than is useful to use the ability
          recommendedEfficiency: combatant.hasTalent(SPELLS.PREDATOR_TALENT.id) ? 0.5 : 0.8,
        },
        gcd: null,
        timelineSortIndex: 20,
      },
      {
        spell: SPELLS.FERAL_FRENZY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.FERAL_FRENZY_TALENT.id),
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
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
          base: (combatant) => (combatant.hasBuff(SPELLS.CAT_FORM.id) ? 1000 : 1500),
        },
        timelineSortIndex: 30,
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: (combatant) => (combatant.hasBuff(SPELLS.CAT_FORM.id) ? 1000 : 1500),
        },
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.MAIM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 32,
        primaryCoefficient: 0.092, // damage per combo point
      },
      {
        spell: SPELLS.DASH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 120,
        gcd: (combatant) => {
          if (combatant.hasBuff(SPELLS.CAT_FORM.id)) {
            // off the GCD if player is already in cat form
            return null;
          }
          return {
            static: 1500,
          };
        },
        isDefensive: true,
        timelineSortIndex: 43,
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT.id),
        cooldown: 45,
        gcd: (combatant) => {
          if (combatant.hasBuff(SPELLS.CAT_FORM.id)) {
            // off the GCD if player is already in cat form
            return null;
          }
          return {
            static: 1500,
          };
        },
        isDefensive: true,
        timelineSortIndex: 43,
      },
      {
        spell: [SPELLS.SKULL_BASH.id, SPELLS.SKULL_BASH_FERAL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 15,
        timelineSortIndex: 33,
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
        spell: SPELLS.REBIRTH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        // 10 minute cooldown usually, but shares the group-wide charge system during raid bosses and M+
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        cooldown: 50,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.TYPHOON.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 35,
      },
      {
        spell: SPELLS.HIBERNATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 36,
      },
      {
        spell: SPELLS.SOOTHE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 37,
      },
      {
        spell: SPELLS.RENEWAL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        gcd: null,
        isDefensive: true,
        timelineSortIndex: 42,
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
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        gcd: null,
        timelineSortIndex: 42,
      },
      {
        spell: SPELLS.BEAR_FORM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        isDefensive: true,
        timelineSortIndex: 51,
      },
      {
        spell: SPELLS.CAT_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 50,
      },
      {
        spell: SPELLS.MOONKIN_FORM_AFFINITY.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 54,
      },
      {
        spell: SPELLS.TRAVEL_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 52,
      },
      {
        spell: SPELLS.STAG_FORM.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 53,
      },
      {
        spell: SPELLS.GROWL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 8,
      },
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 6 / (1 + haste),
      },
      {
        spell: SPELLS.THRASH_BEAR.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 6 / (1 + haste),
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
        spell: SPELLS.REMOVE_CORRUPTION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        // 8 second cooldown if it removed something, no cooldown otherwise
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
        spell: SPELLS.STARFIRE_AFFINITY.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WRATH.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.STARSURGE_AFFINITY.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
      },
      {
        spell: SPELLS.SUNFIRE_AFFINITY.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLAP.id,
        category: SPELL_CATEGORY.UTILITY,
        // only usable in Moonkin form so need Balance affinity, also need to learn from a tome
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        gcd: {
          static: 500,
        },
      },
      {
        spell: SPELLS.IRONFUR.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_FERAL.id),
        gcd: null,
        cooldown: 0.5,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_FERAL.id),
        gcd: {
          base: 1500,
        },
        // unlike Guardian's version doesn't have charges
        cooldown: (haste) => 36 / (1 + haste),
      },
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
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

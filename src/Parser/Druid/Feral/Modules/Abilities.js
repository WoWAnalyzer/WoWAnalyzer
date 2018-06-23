import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.SHRED,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.RAKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.RIP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.FEROCIOUS_BITE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SAVAGE_ROAR_TALENT,
        buffSpellId: SPELLS.SAVAGE_ROAR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id),
        // fixed 1.0
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.MOONFIRE_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id),
        // 1.0 reduced by haste
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 3,
      },

      {
        spell: SPELLS.THRASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.CAT_SWIPE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.BRUTAL_SLASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // when taken, still used on single target
        enabled: combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        cooldown: haste => 8 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
        },
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 11,
      },

      {
        spell: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT,
        buffSpellId: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        // 1.0 reduced by haste (possibly a bug, likely should be 1.0 fixed)
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 22,
      },
      {
        spell: SPELLS.BERSERK,
        buffSpellId: SPELLS.BERSERK.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 22,
      },
      {
        spell: SPELLS.TIGERS_FURY,
        buffSpellId: SPELLS.TIGERS_FURY.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        gcd: false,
        timelineSortIndex: 20,
      },
      {
        spell: SPELLS.FERAL_FRENZY_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.FERAL_FRENZY_TALENT.id),
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
        },
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 21,
      },
      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.0 reduced by haste
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 30,
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.0 reduced by haste
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.MAIM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        // 1.0 fixed
        gcd: {
          static: 1000,
        },
        timelineSortIndex: 32,
      },
      {
        spell: SPELLS.DASH,
        buffSpellId: SPELLS.DASH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.TIGERS_DASH_TALENT.id),
        cooldown: 120,
        // triggers a 1.5 fixed GCD if used when not in cat form (which is rare for a Feral druid)
        gcd: false,
        isDefensive: true,
        timelineSortIndex: 43,
      },
      {
        spell: SPELLS.TIGERS_DASH_TALENT,
        buffSpellId: SPELLS.TIGERS_DASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGERS_DASH_TALENT.id),
        cooldown: 45,
        // triggers a 1.5 fixed GCD if used when not in cat form (which is rare for a Feral druid)
        gcd: false,
        isDefensive: true,
        timelineSortIndex: 43,
      },
      {
        spell: [SPELLS.STAMPEDING_ROAR_HUMANOID, SPELLS.STAMPEDING_ROAR_CAT, SPELLS.STAMPEDING_ROAR_BEAR],
        // buffSpellId matches the version that was cast, but vast majority for Feral will be the cat version
        buffSpellId: SPELLS.STAMPEDING_ROAR_CAT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        // 1.0 reduced by haste
        gcd: {
          base: 1000,
        },
        isDefensive: true,
        timelineSortIndex: 44,
      },
      {
        spell: SPELLS.SKULL_BASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: false,
        timelineSortIndex: 33,
      },
      {
        spell: SPELLS.PROWL,
        buffSpellId: SPELLS.PROWL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6,
        gcd: false,
        timelineSortIndex: 25,
      },
      {
        spell: SPELLS.PROWL_INCARNATION,
        buffSpellId: SPELLS.PROWL_INCARNATION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: false,
        timelineSortIndex: 26,
      },
      {
        spell: SPELLS.SHADOWMELD,
        buffSpellId: SPELLS.SHADOWMELD.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        isUndetectable: true,
        gcd: false,
        timelineSortIndex: 24,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        buffSpellId: SPELLS.SURVIVAL_INSTINCTS.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        charges: 2,
        gcd: false,
        isDefensive: true,
        timelineSortIndex: 40,
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: true,
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        cooldown: 50,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        cooldown: 30,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.TYPHOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
        cooldown: 30,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 35,
      },
      {
        spell: SPELLS.HIBERNATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 36,
      },
      {
        spell: SPELLS.SOOTHE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 37,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        gcd: false,
        isDefensive: true,
        timelineSortIndex: 42,
      },
      {
        spell: [SPELLS.WILD_CHARGE_TALENT, SPELLS.WILD_CHARGE_MOONKIN, SPELLS.WILD_CHARGE_CAT, SPELLS.WILD_CHARGE_BEAR, SPELLS.WILD_CHARGE_TRAVEL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        // 0.5 fixed
        gcd: {
          static: 500,
        },
        timelineSortIndex: 42,
      },
      {
        spell: SPELLS.BEAR_FORM,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        isDefensive: true,
        timelineSortIndex: 51,
      },
      {
        spell: SPELLS.CAT_FORM,
        buffSpellId: SPELLS.CAT_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 50,
      },
      {
        spell: SPELLS.MOONKIN_FORM_AFFINITY,
        buffSpellId: SPELLS.MOONKIN_FORM_AFFINITY.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90, // only has a cooldown for feral spec - not guardian or resto
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 54,
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        buffSpellId: SPELLS.TRAVEL_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 52,
      },
      {
        spell: SPELLS.STAG_FORM,
        buffSpellId: SPELLS.STAG_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 53,
      },
    ];
  }
}

export default Abilities;

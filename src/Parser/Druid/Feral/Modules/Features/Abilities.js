import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {

  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.SHRED,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        isOnGCD: true, 
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.RAKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        isOnGCD: true,
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.RIP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        isOnGCD: true, 
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.FEROCIOUS_BITE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // fixed 1.0
        isOnGCD: true, 
        timelineSortIndex: 6,
      },
      {
        spell: SPELLS.SAVAGE_ROAR_TALENT,
        buffSpellId: SPELLS.SAVAGE_ROAR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id),
        // fixed 1.0
        isOnGCD: true, 
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.MOONFIRE_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id),
        // 1.0 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 3,
      },

      {
        spell: SPELLS.THRASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        // 1.0 fixed
        isOnGCD: true, 
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.CAT_SWIPE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        // 1.0 fixed
        isOnGCD: true, 
        timelineSortIndex: 11,
      },
      {
        spell: SPELLS.BRUTAL_SLASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // when taken, still used on single target
        enabled: combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        cooldown: haste => 12 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
        },
        // 1.0 fixed
        isOnGCD: true, 
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
        isOnGCD: false,
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
        isOnGCD: false,
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
        isOnGCD: false,
        timelineSortIndex: 20,
      },
      {
        spell: SPELLS.ASHAMANES_FRENZY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
        },
        // 1.0 fixed
        isOnGCD: true, 
        timelineSortIndex: 21,
      },
      {
        spell: SPELLS.ELUNES_GUIDANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.ELUNES_GUIDANCE_TALENT.id),
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: false,
        timelineSortIndex: 23,
      },

      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.0 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 30,
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.0 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.MAIM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        // 1.0 fixed
        isOnGCD: true, 
        timelineSortIndex: 32,
      },
      {
        spell: SPELLS.DASH,
        buffSpellId: SPELLS.DASH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        isOnGCD: false,
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
        isOnGCD: true, 
        // setting isDefensive breaks the death recap pane. It doesn't like multiple spells in one ability?
        //isDefensive: true,
        timelineSortIndex: 44,
      },
      {
        spell: SPELLS.SKULL_BASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        timelineSortIndex: 33,
      },
      {
        spell: SPELLS.PROWL,
        buffSpellId: SPELLS.PROWL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6,
        isOnGCD: false,
        timelineSortIndex: 25,
      },
      {
        spell: SPELLS.PROWL_INCARNATION,
        buffSpellId: SPELLS.PROWL_INCARNATION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        timelineSortIndex: 26,
      },
      {
        spell: SPELLS.SHADOWMELD,
        buffSpellId: SPELLS.SHADOWMELD.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        isUndetectable: true,
        isOnGCD: false,
        timelineSortIndex: 24,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        buffSpellId: SPELLS.SURVIVAL_INSTINCTS.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        charges: 2,
        isOnGCD: false,
        isDefensive: true,
        timelineSortIndex: 40,
      },
      {
        // automatically activated on leaving cat form
        spell: SPELLS.PROTECTION_OF_ASHAMANE,
        buffSpellId: SPELLS.PROTECTION_OF_ASHAMANE_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        enabled: combatant.traitsBySpellId[SPELLS.PROTECTION_OF_ASHAMANE.id] > 0,
        isOnGCD: false,
        isDefensive: true,
        timelineSortIndex: 41,
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        cooldown: 50,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        cooldown: 30,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 34,
      },
      {
        spell: SPELLS.TYPHOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
        cooldown: 30,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 35,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        isOnGCD: false,
        isDefensive: true,
        timelineSortIndex: 42,
      },
      {
        spell: SPELLS.DISPLACER_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.DISPLACER_BEAST_TALENT.id),
        cooldown: 30,
        // 1.5 reduced by haste
        isOnGCD: true, 
        isDefensive: true,
        timelineSortIndex: 42,
      },
      {
        spell: [SPELLS.WILD_CHARGE_TALENT, SPELLS.WILD_CHARGE_MOONKIN, SPELLS.WILD_CHARGE_CAT, SPELLS.WILD_CHARGE_BEAR, SPELLS.WILD_CHARGE_TRAVEL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        isOnGCD: false,
        timelineSortIndex: 42,
      },
      {
        spell: SPELLS.BEAR_FORM,
        buffSpellId: SPELLS.BEAR_FORM.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        // 1.5 reduced by haste
        isOnGCD: true, 
        isDefensive: true,
        timelineSortIndex: 51,
      },
      {
        spell: SPELLS.CAT_FORM,
        buffSpellId: SPELLS.CAT_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 50,
      },
      {
        spell: SPELLS.MOONKIN_FORM_AFFINITY,
        buffSpellId: SPELLS.MOONKIN_FORM_AFFINITY.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90, // only has a cooldown for feral spec - not guardian or resto
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 54,
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        buffSpellId: SPELLS.TRAVEL_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 52,
      },
      {
        spell: SPELLS.STAG_FORM,
        buffSpellId: SPELLS.STAG_FORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // 1.5 reduced by haste
        isOnGCD: true, 
        timelineSortIndex: 53,
      },
    ];
  }
}

export default Abilities;

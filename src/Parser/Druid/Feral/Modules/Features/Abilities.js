import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.SHRED,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RAKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RIP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FEROCIOUS_BITE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SAVAGE_ROAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.MOONFIRE_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id),
        isOnGCD: true,
      },

      {
        spell: SPELLS.THRASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CAT_SWIPE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        enabled: !combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
        isOnGCD: true,
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
        isOnGCD: true,
      },

      {
        spell: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.BERSERK,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.TIGERS_FURY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.ASHAMANES_FRENZY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 75,
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
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
      },

      {
        spell: SPELLS.REGROWTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MAIM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DASH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SKULL_BASH_FERAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
      },
      {
        spell: SPELLS.SHADOWMELD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        isUndetectable: true,
        isOnGCD: false,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        charges: 2,
        isOnGCD: false,
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        cooldown: 50,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TYPHOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RENEWAL_TALENT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
        cooldown: 90,
        isOnGCD: false,
      },
      {
        spell: SPELLS.DISPLACER_BEAST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.DISPLACER_BEAST_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: [SPELLS.WILD_CHARGE_TALENT, SPELLS.WILD_CHARGE_MOONKIN, SPELLS.WILD_CHARGE_CAT, SPELLS.WILD_CHARGE_BEAR, SPELLS.WILD_CHARGE_TRAVEL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
        isOnGCD: false,
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
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.TRAVEL_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.STAG_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

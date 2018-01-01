import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

const debug = false;

const GCD = 1.5;
const MANGLE_BASE_CD = 6;
const THRASH_BASE_CD = 6;

const GORE_BASE_CHANCE = 0.1;
const BEAR_HUG_CHANCE = 0.05;
const T19_2SET_CHANCE = 0.1;

// The  amount of time after a proc has occurred when casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;

const hastedCooldown = (baseCD, haste) => (baseCD / (1 + haste));

class Abilities extends CoreAbilities {
  static ABILITIES = [
    // Rotational Spells
    {
      spell: SPELLS.MANGLE_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
          return null;
        }

        return hastedCooldown(6, haste);
      },

      isOnGCD: true,
      isFiller: false,
    },
    {
      spell: SPELLS.SWIPE_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,

      isOnGCD: true,
      isFiller: (event, combatant, targets) => targets.length < 4,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,

      isOnGCD: true,
      isFiller: ({ timestamp, targetID }, combatant, targets, lastCast) => {
        if (combatant.hasTalent(SPELLS.GALACTIC_GUARDIAN_TALENT.id)) {
          return (
            // Account for reaction time; the player must have had the proc for at least this long
            !combatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id, timestamp - REACTION_TIME_THRESHOLD)
          );
        }

        return (
          targets.every(target => target.hasBuff(SPELLS.MOONFIRE_BEAR.id, timestamp - 1)) // Moonfire was already ticking
        );

      },
    },
    {
      spell: SPELLS.THRASH_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
          return null;
        }

        return hastedCooldown(6, haste);
      },

      isOnGCD: true,
      isFiller: false,
    },
    {
      spell: SPELLS.MAUL,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,

      isOnGCD: true,
      isFiller: false,
      // Maul should never be considered a replacement for filler, but it should be tracked
      condition: false,
    },
    // Cooldowns
    {
      spell: SPELLS.BARKSKIN,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 90 - (90 / 3) : 90;
        const cdTrait = combatant.traitsBySpellId[SPELLS.PERPETUAL_SPRING_TRAIT.id] || 0;
        return baseCd * (1 - (cdTrait * 3 / 100));
      },
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SURVIVAL_INSTINCTS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
        debug && console.log(`Survival CD ${baseCd}`);
        return baseCd;
      },
      charges: 3,
      isActive: combatant => combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SURVIVAL_INSTINCTS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
        debug && console.log(`Survival CD ${baseCd}`);
        return baseCd;
      },
      charges: 2,
      isActive: combatant => !combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.BRISTLING_FUR_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.IRONFUR,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.RAGE_OF_THE_SLEEPER,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      noSuggestion: true,
    },
    {
      spell: SPELLS.FRENZIED_REGENERATION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      charges: 2,
      isActive: combatant => !combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
      noSuggestion: true,
    },
    {
      spell: SPELLS.FRENZIED_REGENERATION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      charges: 3,
      isActive: combatant => combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
      noSuggestion: true,
    },
    {
      spell: SPELLS.PULVERIZE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id),
      noSuggestion: true,

      isOnGCD: true,
      isFiller: false,
      baseCD: null,
      // A spell must meet these conditions to be castable
      condition: ({ timestamp, targetID }, combatant, targets) => {
        const pulverizeTalented = combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id);

        const target = targets.find(t => t.id === targetID);
        if (!target) {
          return false;
        }

        const targetHasThrashStacks = target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
        return pulverizeTalented && targetHasThrashStacks;
      },
    },
    // Raid utility
    {
      spell: SPELLS.STAMPEDING_ROAR_BEAR,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, combatant) => (combatant.hasTalent(SPELLS.GUTTURAL_ROARS_TALENT.id) ? 60 : 120),
      noSuggestion: true,
      noCanBeImproved: true,

      isOnGCD: true,
    },
    {
      spell: SPELLS.GROWL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SKULL_BASH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.BEAR_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.CAT_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.TRAVEL_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MOONKIN_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.REBIRTH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.INCAPACITATING_ROAR,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.INTIMIDATING_ROAR_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
        noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.TYPHOON_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MIGHTY_BASH_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.WILD_CHARGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      isOnGCD: true,
    },
  ];
}

export default Abilities;

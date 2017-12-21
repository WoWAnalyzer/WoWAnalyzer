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

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.MANGLE_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const fightLengthSec = combatant.owner.fightDuration / 1000;
        const gcdTime = GCD / (1 + haste);
        const maxGCDs = Math.ceil(fightLengthSec / gcdTime);
        const mangleCD = MANGLE_BASE_CD / (1 + haste);
        const manglesOnCD = Math.ceil(fightLengthSec / mangleCD);

        const potentialGoreProcs = maxGCDs - manglesOnCD;

        const bearHug = combatant.traitsBySpellId[SPELLS.BEAR_HUG_TRAIT.id] > 0 ? BEAR_HUG_CHANCE : 0;
        const t19 = combatant.hasBuff(SPELLS.GUARDIAN_DRUID_T19_2SET_BONUS_BUFF.id) ? T19_2SET_CHANCE : 0;
        const goreChance = GORE_BASE_CHANCE + bearHug + t19;

        const gainedMangles = potentialGoreProcs * goreChance;
        const totalMangles = manglesOnCD + gainedMangles;
        const effectiveCD = fightLengthSec / totalMangles;

        return effectiveCD;
      },
      noSuggestion: true,

      isOnGCD: true,
      isFiller: false,
      baseCD: 6,
      hastedCD: true,
      // Specifies a way that the spell can be available outside of its normal CD
      proc: ({ timestamp }, combatant) => {
        const hasGoreProc = combatant.hasBuff(SPELLS.GORE_BEAR.id, timestamp);
        return hasGoreProc;
      },
    },
    {
      spell: SPELLS.BEAR_SWIPE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,

      isOnGCD: true,
      isFiller: (event, combatant, targets) => targets.length < 4,
      baseCD: null,
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
      baseCD: null,
    },
    {
      spell: SPELLS.THRASH_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const hasMightBuff = combatant.hasTalent(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id);
        if (!hasMightBuff) {
          return 6 / (1 + haste);
        }

        const fightDuration = combatant.owner.fightDuration / 1000;
        const mightBuff = Math.ceil(fightDuration / 180);
        const castsDuringMight = (mightBuff * 30) / (1.5 / (1 + haste));
        const castsOutsideMight = (fightDuration - (mightBuff * 30)) / (6 / (1 + haste));
        return fightDuration / (castsDuringMight + castsOutsideMight);
      },
      noSuggestion: true,

      isOnGCD: true,
      isFiller: false,
      baseCD: 6,
      hastedCD: true,
      proc: ({ timestamp }, combatant) => {
        const isIncarnation = combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id, timestamp);
        return isIncarnation;
      },
    },
    {
      spell: SPELLS.MAUL,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,

      isOnGCD: true,
      isFiller: false,
      baseCD: null,
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
        debug && console.log(`Barkskin CD ${baseCd * (1 - (cdTrait * 3 / 100))}`);
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
    //To Do: Finish adding spells.

  ];
}

export default Abilities;

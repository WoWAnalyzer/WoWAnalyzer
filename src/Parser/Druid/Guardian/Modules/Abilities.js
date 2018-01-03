import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

import Ability from './Ability';

const debug = false;

// The amount of time after a proc has occurred when casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;

const hastedCooldown = (baseCD, haste) => (baseCD / (1 + haste));

class Abilities extends CoreAbilities {
  static ABILITY_CLASS = Ability;

  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      // Rotational Spells
      {
        spell: SPELLS.MANGLE_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => {
          if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return null;
          }

          return hastedCooldown(6, haste);
        },

        isOnGCD: true,
        antiFillerSpam: {
          isFiller: false,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SWIPE_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,

        isOnGCD: true,
        antiFillerSpam: {
          isFiller: (event, combatant, targets) => targets.length < 4,
        },
      },
      {
        spell: SPELLS.MOONFIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,

        isOnGCD: true,
        antiFillerSpam: {
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
      },
      {
        spell: SPELLS.THRASH_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => {
          if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return null;
          }

          return hastedCooldown(6, haste);
        },

        isOnGCD: true,
        antiFillerSpam: {
          isFiller: false,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.MAUL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,

        isOnGCD: true,
        antiFillerSpam: {
          isFiller: false,
          // Maul should never be considered a replacement for filler, but it should be tracked
          condition: false,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.BARKSKIN,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 90 - (90 / 3) : 90;
          const cdTrait = combatant.traitsBySpellId[SPELLS.PERPETUAL_SPRING_TRAIT.id] || 0;
          return baseCd * (1 - (cdTrait * 3 / 100));
        },
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
          debug && console.log(`Survival CD ${baseCd}`);
          return baseCd;
        },
        charges: 3,
        enabled: combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
          debug && console.log(`Survival CD ${baseCd}`);
          return baseCd;
        },
        charges: 2,
        enabled: !combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      },
      {
        spell: SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id),
      },
      {
        spell: SPELLS.BRISTLING_FUR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT.id),
      },
      {
        spell: SPELLS.IRONFUR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.RAGE_OF_THE_SLEEPER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        charges: 2,
        enabled: !combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        charges: 3,
        enabled: combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
      },
      {
        spell: SPELLS.PULVERIZE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id),

        isOnGCD: true,
        antiFillerSpam: {
          isFiller: false,
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
      },
      // Raid utility
      {
        spell: SPELLS.STAMPEDING_ROAR_BEAR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, combatant) => (combatant.hasTalent(SPELLS.GUTTURAL_ROARS_TALENT.id) ? 60 : 120),

        isOnGCD: true,
      },
      {
        spell: SPELLS.GROWL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.SKULL_BASH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        spell: SPELLS.TRAVEL_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MOONKIN_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.REBIRTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INCAPACITATING_ROAR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INTIMIDATING_ROAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TYPHOON_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.WILD_CHARGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

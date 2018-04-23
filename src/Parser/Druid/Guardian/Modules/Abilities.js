import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';
import Enemies from 'Parser/Core/Modules/Enemies';

import Ability from './Ability';

const debug = false;

// The amount of time after a proc has occurred when casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;

const hastedCooldown = (baseCD, haste) => (baseCD / (1 + haste));

class Abilities extends CoreAbilities {
  static ABILITY_CLASS = Ability;
  static dependencies = {
    ...CoreAbilities.dependencies,
    enemies: Enemies,
  };

  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational Spells
      {
        spell: SPELLS.MANGLE_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, selectedCombatant) => {
          if (selectedCombatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return hastedCooldown(1.5, haste);
          }
          return hastedCooldown(6, haste);
        },
        isOnGCD: true,
        antiFillerSpam: {
          isHighPriority: true,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
          averageIssueEfficiency: 0.6,
          majorIssueEfficiency: 0.5,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.THRASH_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, selectedCombatant) => {
          if (selectedCombatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return hastedCooldown(1.5, haste);
          }
          return hastedCooldown(6, haste);
        },
        isOnGCD: true,
        antiFillerSpam: {
          isHighPriority: true,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.MOONFIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        antiFillerSpam: {
          isFiller: (event, selectedCombatant, targets) => {
            if (combatant.hasTalent(SPELLS.GALACTIC_GUARDIAN_TALENT.id) && selectedCombatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id)) {
              return false;
            }
            // Check if moonfire is present on the current target
            // Note that if the current target has no enemy data we can't track whether the dot
            // is ticking or not, in that case we consider it non-filler as a concession.
            if (!this.enemies.getEntity(event) || !this.enemies.getEntity(event).hasBuff(SPELLS.MOONFIRE_BEAR.id, event.timestamp)) {
              return false;
            }
            // Check if moonfire was missing on a secondary target (if using LatC)
            if (combatant.hasShoulder(ITEMS.LADY_AND_THE_CHILD.id)) {
              return targets.every(target => target.hasBuff(SPELLS.MOONFIRE_BEAR.id, event.timestamp - 1));
            }
            return true;
          },
          isHighPriority: ({ timestamp }, selectedCombatant) => {
            // Account for reaction time; the player must have had the proc for at least this long
            return selectedCombatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id, timestamp - REACTION_TIME_THRESHOLD);
          },
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SWIPE_BEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        antiFillerSpam: {
          isFiller: (event, selectedCombatant, targets) => targets.length < 4,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.MAUL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        timelineSortIndex: 5,
      },
      // Cooldowns
      {
        spell: SPELLS.BARKSKIN,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, selectedCombatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 90 - (90 / 3) : 90;
          const cdTrait = combatant.traitsBySpellId[SPELLS.PERPETUAL_SPRING_TRAIT.id] || 0;
          return baseCd * (1 - (cdTrait * 3 / 100));
        },
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, selectedCombatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
          debug && console.log(`Survival CD ${baseCd}`);
          return baseCd;
        },
        charges: 3,
        enabled: combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.SURVIVAL_INSTINCTS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, selectedCombatant) => {
          const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
          debug && console.log(`Survival CD ${baseCd}`);
          return baseCd;
        },
        charges: 2,
        enabled: !combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BRISTLING_FUR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT.id),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.IRONFUR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        timelineSortIndex: 7,
      },
      {
        spell: SPELLS.RAGE_OF_THE_SLEEPER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        charges: 2,
        enabled: !combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        charges: 3,
        enabled: combatant.traitsBySpellId[SPELLS.FLESHKNITTING_TRAIT],
        timelineSortIndex: 8,
      },
      {
        spell: SPELLS.PULVERIZE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id),
        isOnGCD: true,
        antiFillerSpam: {
          // A spell must meet these conditions to be castable
          isHighPriority: ({ timestamp, targetID }, selectedCombatant, targets) => {
            const pulverizeTalented = combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id);
            const target = targets.find(t => t.id === targetID);
            if (!target) {
              return false;
            }
            const targetHasThrashStacks = target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
            return pulverizeTalented && targetHasThrashStacks;
          },
        },
        timelineSortIndex: 6,
      },
      // Raid utility
      {
        spell: SPELLS.STAMPEDING_ROAR_BEAR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, selectedCombatant) => (combatant.hasTalent(SPELLS.GUTTURAL_ROARS_TALENT.id) ? 60 : 120),
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
        enabled: !combatant.hasTalent(SPELLS.INTIMIDATING_ROAR_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INTIMIDATING_ROAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.INTIMIDATING_ROAR_TALENT.id),
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
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
        cooldown: 30,
        isOnGCD: true,
      },
      {
        spell: [SPELLS.WILD_CHARGE_TALENT, SPELLS.WILD_CHARGE_MOONKIN, SPELLS.WILD_CHARGE_CAT, SPELLS.WILD_CHARGE_BEAR, SPELLS.WILD_CHARGE_TRAVEL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
      },
    ];
  }
}

export default Abilities;

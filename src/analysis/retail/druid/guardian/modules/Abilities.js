import CoreAbilities from 'analysis/retail/druid/core/Abilities';
import SPELLS from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Enemies from 'parser/shared/modules/Enemies';

import Ability from './Ability';

// The amount of time after a proc has occurred when casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;

const hastedCooldown = (baseCD, haste) => baseCD / (1 + haste);

class Abilities extends CoreAbilities {
  static ABILITY_CLASS = Ability;
  static dependencies = {
    ...CoreAbilities.dependencies,
    enemies: Enemies,
  };

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => {
          if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return hastedCooldown(1.5, haste);
          }
          return hastedCooldown(6, haste);
        },
        gcd: {
          base: 1500,
        },
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
        spell: SPELLS.THRASH_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => {
          if (combatant.hasBuff(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)) {
            return hastedCooldown(1.5, haste);
          }
          return hastedCooldown(6, haste);
        },
        gcd: {
          base: 1500,
        },
        antiFillerSpam: {
          isHighPriority: true,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.MOONFIRE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        antiFillerSpam: {
          isFiller: (event, selectedCombatant, targets) => {
            if (
              combatant.hasTalent(SPELLS.GALACTIC_GUARDIAN_TALENT) &&
              selectedCombatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id)
            ) {
              return false;
            }
            // Check if moonfire is present on the current target
            // Note that if the current target has no enemy data we can't track whether the dot
            // is ticking or not, in that case we consider it non-filler as a concession.
            if (
              !this.enemies.getEntity(event) ||
              !this.enemies.getEntity(event).hasBuff(SPELLS.MOONFIRE_DEBUFF.id, event.timestamp)
            ) {
              return false;
            }
            return true;
          },
          isHighPriority: ({ timestamp }, selectedCombatant) =>
            // Account for reaction time; the player must have had the proc for at least this long
            selectedCombatant.hasBuff(
              SPELLS.GALACTIC_GUARDIAN.id,
              timestamp - REACTION_TIME_THRESHOLD,
            ),
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        antiFillerSpam: {
          isFiller: (event, selectedCombatant, targets) => targets.length < 4,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.MAUL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      // Cat Form abilities
      {
        spell: SPELLS.SHRED.id,
        // Technically available baseline, but it is never used without FA
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RAKE.id,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RIP.id,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        enabled: combatant.hasTalent(SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.SURVIVAL_INSTINCTS.id,
        buffSpellId: SPELLS.SURVIVAL_INSTINCTS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT) ? 240 - 240 / 3 : 240,
        charges: 2,
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BRISTLING_FUR_TALENT.id,
        buffSpellId: SPELLS.BRISTLING_FUR_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.PULVERIZE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(SPELLS.PULVERIZE_TALENT),
        gcd: {
          base: 1500,
        },
        antiFillerSpam: {
          // A spell must meet these conditions to be castable
          isHighPriority: ({ timestamp, targetID }, selectedCombatant, targets) => {
            const pulverizeTalented = combatant.hasTalent(SPELLS.PULVERIZE_TALENT);
            const target = targets.find((t) => t.id === targetID);
            if (!target) {
              return false;
            }
            const targetHasThrashStacks =
              target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
            return pulverizeTalented && targetHasThrashStacks;
          },
        },
        timelineSortIndex: 6,
      },
      // Raid utility
      {
        spell: SPELLS.SKULL_BASH.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.MASS_ENTANGLEMENT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIGHTY_BASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT),
        cooldown: 50,
        gcd: {
          base: 1500,
        },
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
        enabled: combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT),
      },
      {
        spell: SPELLS.TIGER_DASH_TALENT.id,
        buffSpellId: SPELLS.TIGER_DASH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT),
        gcd: {
          base: 1500,
        },
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

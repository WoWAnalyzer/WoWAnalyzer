import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;

    // moving class abilities here as theyre updated
    return [
      // Offensive

      // Defensive
      {
        spell: TALENTS.DARK_PACT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.FREQUENT_DONOR_TALENT) ? 45 : 60,
        enabled: combatant.hasTalent(TALENTS.DARK_PACT_TALENT),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.REGULAR,
          recommendedEfficiency: 0.6,
          averageIssueEfficiency: 0.4,
          majorIssueEfficiency: 0.2,
        },
        buffSpellId: TALENTS.DARK_PACT_TALENT.id,
      },
      {
        spell: SPELLS.UNENDING_RESOLVE.id,
        buffSpellId: SPELLS.UNENDING_RESOLVE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180 - (combatant.hasTalent(TALENTS.DARK_ACCORD_TALENT) ? 45 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0.1,
        },
      },

      // Utility
      {
        spell: SPELLS.FEL_DOMINATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 180 - combatant.getTalentRank(TALENTS.FEL_PACT_TALENT) * 30,
        gcd: null,
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_SUMMON.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.DEMONIC_CIRCLE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TELEPORT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.DEMONIC_CIRCLE_TALENT),
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SOULBURN_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.SOULBURN_TALENT),
        cooldown: 6,
      },
    ];
  }
}

export default Abilities;

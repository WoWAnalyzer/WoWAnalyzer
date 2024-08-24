import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreAbilities from 'analysis/retail/mage/shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.ARCANE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.ARCANE_BLAST.id],
      },
      {
        spell: TALENTS.ARCANE_MISSILES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ARCANE_MISSILES_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_BARRAGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_ORB.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        charges: 1 + combatant.getTalentRank(TALENTS.CHARGED_ORB_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: combatant.hasTalent(TALENTS.CHARGED_ORB_TALENT) ? 0.9 : 0.8,
          averageIssueEfficiency: combatant.hasTalent(TALENTS.CHARGED_ORB_TALENT) ? 0.8 : 0.65,
          majorIssueEfficiency: combatant.hasTalent(TALENTS.CHARGED_ORB_TALENT) ? 0.6 : 0.5,
        },
        damageSpellIds: [SPELLS.ARCANE_ORB_DAMAGE.id],
      },

      // Cooldowns
      {
        spell: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
        cooldown: 45,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.ARCANE_SURGE_TALENT.id,
        buffSpellId: TALENTS.ARCANE_SURGE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.EVOCATION_TALENT.id,
        buffSpellId: TALENTS.EVOCATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.EVOCATION_TALENT),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        buffSpellId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT),
        gcd: null,
        cooldown: 45,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.6,
        },
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

import CoreAbilities from 'analysis/retail/druid/shared/core/Abilities';
import SPELLS from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import Enemies from 'parser/shared/modules/Enemies';
import { hasted, normalGcd } from 'common/abilitiesConstants';
import { inBerserk } from 'analysis/retail/druid/guardian/constants';

class Abilities extends CoreAbilities {
  static dependencies = {
    ...CoreAbilities.dependencies,
    enemies: Enemies,
  };

  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.MANGLE_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) =>
          inBerserk(combatant) && combatant.hasTalent(TALENTS_DRUID.BERSERK_RAVAGE_TALENT)
            ? hasted(3, haste)
            : hasted(6, haste),
        gcd: {
          base: 1500,
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
        cooldown: (haste) =>
          inBerserk(combatant) && combatant.hasTalent(TALENTS_DRUID.BERSERK_RAVAGE_TALENT)
            ? hasted(3, haste)
            : hasted(6, haste),
        gcd: {
          base: 1500,
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
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SWIPE_BEAR.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
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
      {
        spell: TALENTS_DRUID.RAZE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.RAZE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.IRONFUR.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.IRONFUR_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
        isDefensive: true,
      },
      {
        spell: SPELLS.FRENZIED_REGENERATION.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.FRENZIED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: (haste) =>
          inBerserk(combatant) && combatant.hasTalent(TALENTS_DRUID.BERSERK_PERSISTENCE_TALENT)
            ? 0
            : hasted(
                36 * (1 - 0.2 * combatant.getTalentRank(TALENTS_DRUID.REINVIGORATION_TALENT)),
                haste,
              ), // TODO TWW change this to 0.10 per rank in 11.0.2
        gcd: normalGcd,
        charges: 1 + combatant.getTalentRank(TALENTS_DRUID.INNATE_RESOLVE_TALENT),
        isDefensive: true,
      },

      // Cooldowns
      {
        spell: SPELLS.SURVIVAL_INSTINCTS.id,
        buffSpellId: SPELLS.SURVIVAL_INSTINCTS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          180 * (1 - combatant.getTalentRank(TALENTS_DRUID.SURVIVAL_OF_THE_FITTEST_TALENT) * 0.12),
        charges: 1 + combatant.getTalentRank(TALENTS_DRUID.IMPROVED_SURVIVAL_INSTINCTS_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.BERSERK_BEAR.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        enabled: !combatant.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: SPELLS.INCARNATION_GUARDIAN_OF_URSOC.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS_DRUID.BRISTLING_FUR_TALENT.id,
        buffSpellId: TALENTS_DRUID.BRISTLING_FUR_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 40,
        enabled: combatant.hasTalent(TALENTS_DRUID.BRISTLING_FUR_TALENT),
        timelineSortIndex: 9,
      },
      {
        spell: TALENTS_DRUID.PULVERIZE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS_DRUID.PULVERIZE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 45 - combatant.getTalentRank(TALENTS_DRUID.TEAR_DOWN_THE_MIGHTY_TALENT) * 10,
        timelineSortIndex: 6,
      },
      {
        spell: TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        timelineSortIndex: 7,
      },
      {
        spell: TALENTS_DRUID.LUNAR_BEAM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_DRUID.LUNAR_BEAM_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        timelineSortIndex: 8,
        isDefensive: true,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

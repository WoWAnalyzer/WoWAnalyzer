import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'analysis/retail/evoker/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/evoker';
import { EMPOWER_BASE_GCD, EMPOWER_MINIMUM_GCD } from '../../shared';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    const interwovenThreadsMultiplier = combatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT)
      ? 0.9
      : 1;
    return [
      //region Rotational
      {
        spell: TALENTS.EBON_MIGHT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30 * interwovenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EBON_MIGHT_TALENT),
      },
      {
        spell: TALENTS.ERUPTION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ERUPTION_TALENT),
      },
      {
        spell: combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
          ? SPELLS.UPHEAVAL_FONT.id
          : SPELLS.UPHEAVAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 40 * interwovenThreadsMultiplier,
        gcd: {
          base: EMPOWER_BASE_GCD,
          minimum: EMPOWER_MINIMUM_GCD,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.UPHEAVAL_TALENT),
      },
      {
        spell: TALENTS.PRESCIENCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12 * interwovenThreadsMultiplier,
        charges: 2,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PRESCIENCE_TALENT),
      },
      {
        spell: TALENTS.BLISTERING_SCALES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30 * interwovenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLISTERING_SCALES_TALENT),
      },
      //endregion
      //region Cooldowns
      {
        spell: combatant.hasTalent(TALENTS.MANEUVERABILITY_TALENT)
          ? SPELLS.BREATH_OF_EONS_SCALECOMMANDER.id
          : TALENTS.BREATH_OF_EONS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120 * interwovenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.9,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.BREATH_OF_EONS_TALENT),
      },
      {
        spell: TALENTS.TIME_SKIP_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180 * interwovenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.9,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.TIME_SKIP_TALENT),
      },
      {
        spell: TALENTS.BESTOW_WEYRNSTONE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 * interwovenThreadsMultiplier,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BESTOW_WEYRNSTONE_TALENT),
      },
      //endregion
      //region Other
      {
        spell: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.EBON_MIGHT_TALENT),
      },
      {
        spell: SPELLS.BLACK_ATTUNEMENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
      },
      {
        spell: SPELLS.TREMBLING_EARTH_BUFF.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
      },
      //endregion
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

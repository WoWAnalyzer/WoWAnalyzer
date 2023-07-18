import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'analysis/retail/evoker/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS/evoker';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Rotational
      {
        spell: TALENTS.EBON_MIGHT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
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
        cooldown: 40,
        gcd: {
          base: 1500,
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
        cooldown: 12,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PRESCIENCE_TALENT),
      },
      {
        spell: TALENTS.BLISTERING_SCALES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLISTERING_SCALES_TALENT),
      },
      //endregion
      //region Cooldowns
      {
        spell: TALENTS.BREATH_OF_EONS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
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
        cooldown: 180,
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
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BESTOW_WEYRNSTONE_TALENT),
      },
      {
        spell: TALENTS.SPATIAL_PARADOX_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SPATIAL_PARADOX_TALENT),
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
      //endregion
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

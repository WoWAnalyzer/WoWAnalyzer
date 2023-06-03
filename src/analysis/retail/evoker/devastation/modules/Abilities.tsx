import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'analysis/retail/evoker/shared/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      //region Rotational
      {
        spell: TALENTS.PYRE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PYRE_TALENT),
      },
      {
        spell: TALENTS.FIRESTORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.FIRESTORM_TALENT),
      },
      {
        spell: combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)
          ? SPELLS.ETERNITY_SURGE_FONT.id
          : SPELLS.ETERNITY_SURGE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: combatant.hasTalent(TALENTS.EVENT_HORIZON_TALENT) ? 27 : 30,
        gcd: {
          base: 500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.ETERNITY_SURGE_TALENT),
      },
      {
        spell: TALENTS.SHATTERING_STAR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: 'You should aim to use this off CD.',
        },
        enabled: combatant.hasTalent(TALENTS.SHATTERING_STAR_TALENT),
      },
      //endregion
      //region Cooldowns
      {
        spell: TALENTS.DRAGONRAGE_TALENT.id,
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
        timelineSortIndex: 0,
        enabled: combatant.hasTalent(TALENTS.DRAGONRAGE_TALENT),
      },
      //region Others
      {
        spell: [SPELLS.BURNOUT_BUFF.id],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: null,
      },
      {
        spell: SPELLS.ESSENCE_BURST_DEV_BUFF.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
        timelineSortIndex: 1,
      },
      //endregion
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'analysis/retail/evoker/shared/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELLS from 'common/SPELLS/evoker';
import { EMPOWER_BASE_GCD, EMPOWER_MINIMUM_GCD } from 'analysis/retail/evoker/shared';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.REVERSION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 9,
        charges: combatant.hasTalent(TALENTS.PUNCTUALITY_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REVERSION_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: combatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
          ? SPELLS.DREAM_BREATH_FONT.id
          : TALENTS.DREAM_BREATH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DREAM_BREATH_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: EMPOWER_BASE_GCD,
          minimum: EMPOWER_MINIMUM_GCD,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.ECHO_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ECHO_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 0,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TIME_DILATION_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.TIME_DILATION_TALENT),
      },
      {
        spell: combatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
          ? SPELLS.SPIRITBLOOM_FONT.id
          : TALENTS.SPIRITBLOOM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: combatant.hasTalent(TALENTS.SPIRITUAL_CLARITY_TALENT) ? 20 : 30,
        gcd: {
          base: EMPOWER_BASE_GCD,
          minimum: EMPOWER_MINIMUM_GCD,
        },
        enabled: combatant.hasTalent(TALENTS.SPIRITBLOOM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.TEMPORAL_ANOMALY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.TEMPORAL_ANOMALY_TALENT),
      },
      {
        spell: TALENTS.REWIND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.TEMPORAL_ARTIFICER_TALENT) ? 180 : 240,
        charges: combatant.hasTalent(TALENTS.ERASURE_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REWIND_TALENT),
      },
      {
        spell: TALENTS.EMERALD_COMMUNION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EMERALD_COMMUNION_TALENT),
      },
      {
        spell: TALENTS.DREAM_FLIGHT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DREAM_FLIGHT_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.STASIS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          static: 0,
        },
        enabled: combatant.hasTalent(TALENTS.STASIS_TALENT),
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

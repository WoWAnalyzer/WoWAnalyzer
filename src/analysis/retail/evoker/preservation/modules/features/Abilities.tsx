import TALENTS from 'common/TALENTS/evoker';
import CoreAbilities from 'analysis/retail/evoker/shared/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SPELLS from 'common/SPELLS';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.REVERSION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 9,
        charges: combatant.hasTalent(TALENTS.PUNCTUALITY_TALENT.id) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REVERSION_TALENT.id),
      },
      {
        spell: SPELLS.DREAM_BREATH_CAST.id,
        enabled: combatant.hasTalent(TALENTS.DREAM_BREATH_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ECHO_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ECHO_TALENT.id),
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
        enabled: combatant.hasTalent(TALENTS.TIME_DILATION_TALENT.id),
      },
      {
        spell: TALENTS.SPIRITBLOOM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SPIRITBLOOM_TALENT.id),
      },
      {
        spell: TALENTS.TEMPORAL_ANOMALY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.TEMPORAL_ANOMALY_TALENT.id),
      },
      {
        spell: TALENTS.REWIND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.TEMPORAL_ARTIFICER_TALENT.id) ? 180 : 240,
        charges: combatant.hasTalent(TALENTS.ERASURE_TALENT.id) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REWIND_TALENT.id),
      },
      {
        spell: TALENTS.EMERALD_COMMUNION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EMERALD_COMMUNION_TALENT.id),
      },
      {
        spell: TALENTS.DREAM_FLIGHT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DREAM_FLIGHT_TALENT.id),
      },
      {
        spell: TALENTS.STASIS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          static: 0,
        },
        enabled: combatant.hasTalent(TALENTS.STASIS_TALENT.id),
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;

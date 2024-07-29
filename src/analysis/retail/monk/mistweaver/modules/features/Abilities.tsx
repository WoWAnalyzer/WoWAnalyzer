import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ANCIENT_ARTS_LEG_SWEEP,
  LIGHTER_THAN_AIR_ROLL,
  PEACE_AND_PROSPERITY_ROP,
} from '../../constants';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 9,
        charges: combatant.hasTalent(TALENTS_MONK.POOL_OF_MISTS_TALENT) ? 3 : 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.MANA_TEA_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 15,
      },
      //soothing mist's category is entirely dependent on your talent selections
      {
        spell: TALENTS_MONK.SOOTHING_MIST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.SOOTHING_MIST_TALENT),
        category: combatant.hasTalent(TALENTS_MONK.PEER_INTO_PEACE_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 100,
      },
      {
        spell: TALENTS_MONK.JADEFIRE_STOMP_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(TALENTS_MONK.JADEFIRE_STOMP_TALENT),
        gcd: {
          base: 1500,
        },
      },
      // Cooldowns
      {
        spell: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
        cooldown: combatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? 60 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 20,
      },
      {
        spell: TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
        cooldown: combatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? 60 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 20,
      },
      {
        spell: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 20,
      },
      {
        spell: TALENTS_MONK.REVIVAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 18,
      },
      {
        spell: TALENTS_MONK.RESTORAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 18,
      },
      {
        spell: TALENTS_MONK.LIFE_COCOON_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_MONK.CHRYSALIS_TALENT) ? 75 : 120,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: TALENTS_MONK.CHI_BURST_SHARED_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_BURST_SHARED_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },

      // Other Spell Casting Metrics
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 19,
      },
      {
        spell: SPELLS.VIVIFY.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        timelineSortIndex: 15,
      },
      {
        spell: SPELLS.EXPEL_HARM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1000,
        },
        cooldown: 15,
      },
      {
        spell: TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS_MONK.VEIL_OF_PRIDE_TALENT) ? 4 : 8,
      },

      // Utility Spells
      {
        spell: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        buffSpellId: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT),
      },
      {
        spell: SPELLS.FORTIFYING_BREW_BRM.id,
        buffSpellId: SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS_MONK.EXPEDITIOUS_FORTIFICATION_TALENT) ? 90 : 120,
        enabled: combatant.hasTalent(TALENTS_MONK.FORTIFYING_BREW_TALENT),
      },
      {
        spell: SPELLS.DETOX.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_MONK.PARALYSIS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.PARALYSIS_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_MONK.RING_OF_PEACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          45 -
          (combatant.hasTalent(TALENTS_MONK.PEACE_AND_PROSPERITY_TALENT)
            ? PEACE_AND_PROSPERITY_ROP
            : 0),
        enabled: combatant.hasTalent(TALENTS_MONK.RING_OF_PEACE_TALENT),
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.LEG_SWEEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          60 - ANCIENT_ARTS_LEG_SWEEP * combatant.getTalentRank(TALENTS_MONK.ANCIENT_ARTS_TALENT),
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.ROLL.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 3 : 2,
        cooldown:
          (combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 15 : 20) +
          (combatant.hasTalent(TALENTS_MONK.LIGHTER_THAN_AIR_TALENT) ? LIGHTER_THAN_AIR_ROLL : 0),
        enabled: !combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
      },
      {
        spell: TALENTS_MONK.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown:
          20 +
          (combatant.hasTalent(TALENTS_MONK.LIGHTER_THAN_AIR_TALENT) ? LIGHTER_THAN_AIR_ROLL : 0),
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
      },
      {
        spell: TALENTS_MONK.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.TIGERS_LUST_TALENT),
      },
      {
        spell: TALENTS_MONK.TRANSCENDENCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        enabled: combatant.hasTalent(TALENTS_MONK.TRANSCENDENCE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasBuff(SPELLS.ESCAPE_FROM_REALITY_CAST.id) ? 0 : 45,
        gcd: {
          base: 1500,
        },
      },

      // Damage Spells
      {
        spell: SPELLS.TIGER_PALM.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.BLACKOUT_KICK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 32,
      },
      {
        spell: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
        category: combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)
          ? SPELL_CATEGORY.ROTATIONAL
          : SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT),
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },
    ];
  }
}

export default Abilities;

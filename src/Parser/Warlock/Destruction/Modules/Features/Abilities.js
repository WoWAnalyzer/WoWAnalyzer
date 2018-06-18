import CoreAbilities from 'Parser/Core/Modules/Abilities';

import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational spells
      {
        spell: SPELLS.CHAOS_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CHANNEL_DEMONFIRE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 25 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CONFLAGRATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 13 / (1 + haste),
        charges: 2,
        // TODO: T19 4p set bonus grants another charge and reduces CD
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SOUL_FIRE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SOUL_FIRE_TALENT.id),
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHADOWBURN_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id),
        // TODO: T19 4p set bonus grants another charge and reduces CD
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.IMMOLATE_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INCINERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAVOC,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 25,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RAIN_OF_FIRE_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CATACLYSM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CATACLYSM_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.SUMMON_INFERNAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DARK_SOUL_INSTABILITY_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DARK_SOUL_INSTABILITY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      // Defensive
      {
        spell: SPELLS.UNENDING_RESOLVE,
        buffSpellId: SPELLS.UNENDING_RESOLVE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        isOnGCD: false,
        castEfficiency: {
          suggestion: false,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.20,
          majorIssueEfficiency: 0.10,
        },
      },
      {
        spell: SPELLS.DARK_PACT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: false,
        enabled: combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
        castEfficiency: {
          suggestion: false,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.20,
          majorIssueEfficiency: 0.10,
        },
      },

      // Utility
      {
        spell: SPELLS.BURNING_RUSH_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.BURNING_RUSH_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DRAIN_LIFE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MORTAL_COIL_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.MORTAL_COIL_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_SUMMON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
        isOnGCD: true,
        cooldown: 10,
        castEfficiency: {
          suggestion: false,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TELEPORT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: false,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.SOULSTONE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 600,
        // TODO: shares cooldown with other combat rezzes, don't know how to calculate properly
        isOnGCD: true,
      },
      {
        spell: SPELLS.DEMONIC_GATEWAY_CAST,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        isOnGCD: true,
      },
      {
        spell: SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.BANISH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CREATE_HEALTHSTONE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CREATE_SOULWELL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ENSLAVE_DEMON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.EYE_OF_KILROGG,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FEAR_CAST,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HEALTH_FUNNEL_CAST,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: [
          SPELLS.SUMMON_IMP,
          SPELLS.SUMMON_VOIDWALKER,
          SPELLS.SUMMON_SUCCUBUS,
          SPELLS.SUMMON_FELHUNTER,
        ],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHADOWFURY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.DARKFURY_TALENT.id) ? 45 : 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.UNENDING_BREATH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

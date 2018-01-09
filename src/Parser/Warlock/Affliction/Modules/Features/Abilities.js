import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational spells
      {
        spell: SPELLS.HAUNT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.HAUNT_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This estimate may not be correct sometimes because of Haunt\'s resets. The real amount of possible Haunts will be higher if there were adds on this fight.',
        },
      },
      {
        spell: SPELLS.PHANTOM_SINGULARITY_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.AGONY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CORRUPTION_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SIPHON_LIFE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.UNSTABLE_AFFLICTION_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DRAIN_SOUL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIFE_TAP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.REAP_SOULS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 5,
      },
      {
        spell: SPELLS.SEED_OF_CORRUPTION_DEBUFF,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },

      // Cooldowns
      {
        spell: SPELLS.SOUL_HARVEST_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: [
          SPELLS.GRIMOIRE_OF_SERVICE_TALENT,
          SPELLS.GRIMOIRE_IMP,
          SPELLS.GRIMOIRE_SUCCUBUS,
          SPELLS.GRIMOIRE_FELHUNTER,
          SPELLS.GRIMOIRE_VOIDWALKER,
        ],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          averageIssueEfficiency: 0.80,
          majorIssueEfficiency: 0.70,
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
        spell: SPELLS.UNENDING_RESOLVE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TALENT_SUMMON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.SOULSTONE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 600,
        // TODO: shares cooldown with other combat rezzes, don't know how to calculate properly
        isOnGCD: true,
      },
      {
        spell: SPELLS.SUMMON_DOOMGUARD_TALENTED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.SUMMON_INFERNAL_TALENTED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.DEMONIC_GATEWAY_CAST,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DARK_PACT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
      },
      {
        spell: SPELLS.MORTAL_COIL_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.MORTAL_COIL_TALENT.id),
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
        spell: SPELLS.UNENDING_BREATH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;

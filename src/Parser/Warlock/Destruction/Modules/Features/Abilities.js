import React from 'react';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

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
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: !combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id),
        // TODO: T19 4p set bonus grants another charge and reduces CD
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SHADOWBURN_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id),
        // TODO: T19 4p set bonus grants another charge and reduces CD
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.DIMENSIONAL_RIFT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        charges: 3,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
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
        spell: SPELLS.LIFE_TAP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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

      // Havoc is a situational CD - it makes all your ST spells to cleave to the Havoc target for 10 seconds
      // It is a baseline CD, but casting it on CD is useless, it doesn't add anything
      {
        spell: SPELLS.HAVOC,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: haste => 45 / (1 + haste),
        enabled: !combatant.hasTalent(SPELLS.WREAK_HAVOC_TALENT.id),
        isOnGCD: true,
      },
      // But if you take Wreak Havoc (-20s CD), you probably intend to do some cleaving and then it should be used as much as possible (but with respect to the encounter)
      {
        spell: SPELLS.HAVOC,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: haste => 25 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.WREAK_HAVOC_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SOUL_HARVEST_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        enabled: !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: [
          SPELLS.GRIMOIRE_OF_SERVICE_TALENT,
          SPELLS.GRIMOIRE_IMP,
          SPELLS.GRIMOIRE_SUCCUBUS,
          SPELLS.GRIMOIRE_FELGUARD,
          SPELLS.GRIMOIRE_FELHUNTER,
          SPELLS.GRIMOIRE_VOIDWALKER,
        ],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: <Wrapper><SpellLink id={SPELLS.GRIMOIRE_IMP.id} /> is the preferred version to use. </Wrapper>,
          recommendedEfficiency: 0.90,
          averageIssueEfficiency: 0.80,
          majorIssueEfficiency: 0.70,
        },
      },

      // Utility
      {
        spell: SPELLS.SHADOWFURY_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.SHADOWFURY_TALENT.id),
        isOnGCD: true,
      },
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

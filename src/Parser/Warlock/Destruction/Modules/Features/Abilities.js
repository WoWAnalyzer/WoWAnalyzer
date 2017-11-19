import SPELLS from 'common/SPELLS';
import React from 'react';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.CHAOS_BOLT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHANNEL_DEMONFIRE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 25 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id),
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.CONFLAGRATE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      charges: 2,
      recommendedCastEfficiency: 0.95,
      isActive: combatant => !combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id),
      // TODO: T19 4p set bonus grants another charge and reduces CD
    },
    {
      spell: SPELLS.SHADOWBURN_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      charges: 2,
      recommendedCastEfficiency: 0.95,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id),
      // TODO: T19 4p set bonus grants another charge and reduces CD
    },
    {
      spell: SPELLS.DIMENSIONAL_RIFT_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      charges: 3,
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.IMMOLATE_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.INCINERATE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.LIFE_TAP,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      extraSuggestion: 'If you\'re using Empowered Life Tap, you should keep a very high uptime on the Empowered Life Tap buff.',
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.RAIN_OF_FIRE_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CATACLYSM_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.CATACLYSM_TALENT.id),
    },

    // Cooldowns

    // Havoc is a situational CD - it makes all your ST spells to cleave to the Havoc target for 10 seconds
    // It is a baseline CD, but casting it on CD is useless, it doesn't add anything
    {
      spell: SPELLS.HAVOC,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45 / (1 + haste),
      isActive: combatant => !combatant.hasTalent(SPELLS.WREAK_HAVOC_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    // But if you take Wreak Havoc (-20s CD), you probably intend to do some cleaving and then it should be used as much as possible (but with respect to the encounter)
    {
      spell: SPELLS.HAVOC,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 25 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.WREAK_HAVOC_TALENT.id),
    },
    {
      spell: SPELLS.SOUL_HARVEST_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
    },
    {
      spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
    },
    {
      spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
    },
    {
      spell: SPELLS.GRIMOIRE_OF_SERVICE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      additionalSpells: [
        SPELLS.GRIMOIRE_IMP,
        SPELLS.GRIMOIRE_SUCCUBUS,
        SPELLS.GRIMOIRE_FELGUARD,
        SPELLS.GRIMOIRE_FELHUNTER,
        SPELLS.GRIMOIRE_VOIDWALKER,
      ],
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id),
      extraSuggestion: <Wrapper><SpellLink id={SPELLS.GRIMOIRE_IMP.id} /> is the preferred version to use. </Wrapper>,
      recommendedCastEfficiency: 0.90,
      averageIssueCastEfficiency: 0.80,
      majorIssueCastEfficiency: 0.70,
    },

    // Utility
    {
      spell: SPELLS.SHADOWFURY_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOWFURY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BURNING_RUSH_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.BURNING_RUSH_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DRAIN_LIFE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.UNENDING_RESOLVE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DEMONIC_CIRCLE_TALENT_SUMMON,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SOULSTONE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 600,
      // TODO: shares cooldown with other combat rezzes, don't know how to calculate properly
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_DOOMGUARD_TALENTED,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_INFERNAL_TALENTED,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DEMONIC_GATEWAY_CAST,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DARK_PACT_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MORTAL_COIL_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTalent(SPELLS.MORTAL_COIL_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BANISH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CREATE_HEALTHSTONE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CREATE_SOULWELL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ENSLAVE_DEMON,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.EYE_OF_KILROGG,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FEAR_CAST,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEALTH_FUNNEL_CAST,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_IMP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_VOIDWALKER,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_FELHUNTER,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_SUCCUBUS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.UNENDING_BREATH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;

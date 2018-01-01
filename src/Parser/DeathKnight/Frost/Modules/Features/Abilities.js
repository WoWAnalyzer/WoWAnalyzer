import React from 'react';

import SPELLS from 'common/SPELLS';
//import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
//import ItemLink from 'common/ItemLink';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

// eslint-disable no-unused-vars

class Abilities extends CoreAbilities {
  static ABILITIES = [
    {
      spell: SPELLS.SINDRAGOSAS_FURY_ARTIFACT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 300,
      recommendedEfficiency: 0.95,
      extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id}/> immediately after it's cooldown is up is important and if you have 5 stacks of <SpellLink id={SPELLS.RAZORICE.id}/> use as it is coming off cooldown.</span>,
    },
    {
      spell: SPELLS.OBLITERATION_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.OBLITERATION_TALENT.id),
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },   
    {
      spell: SPELLS.BREATH_OF_SINDRAGOSA_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id),
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.PILLAR_OF_FROST, // TO DO: Add support for Gravewarden extension bonus, Ice Cap reduction
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown:  (haste, combatant) => (60 - (combatant.hasBuff(SPELLS.ICECAP_TALENT.id) ? 3 : 0)),
      recommendedEfficiency: 0.90,
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.EMPOWER_RUNE_WEAPON, // TO DO Convergence of Fates cd reduction
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedEfficiency: 0.90,
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.HUNGERING_RUNE_WEAPON_TALENT, // TO DO Convergence of Fates cd reduction
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.HUNGERING_RUNE_WEAPON_TALENT.id),
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.OBLITERATE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, 
      recommendedEfficiency: 0.90,
    },
    {
      spell: SPELLS.REMORSELESS_WINTER,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20, 
      recommendedEfficiency: 0.90,
    },
    {
      spell: SPELLS.FROST_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, 
      recommendedEfficiency: 0.90,
    },
  ];
}

export default Abilities;

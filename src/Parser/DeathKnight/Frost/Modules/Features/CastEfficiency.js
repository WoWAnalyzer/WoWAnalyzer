import React from 'react';

import SPELLS from 'common/SPELLS';
//import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
//import ItemLink from 'common/ItemLink';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

// eslint-disable no-unused-vars

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,

    {
      spell: SPELLS.SINDRAGOSAS_FURY_ARTIFACT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 300,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id}/> immediately after it's cooldown is up is important and if you have 5 stacks of <SpellLink id={SPELLS.RAZORICE.id}/> use as it is coming off cooldown.</span>,
    },

    {
      spell: SPELLS.OBLITERATION_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.OBLITERATION_TALENT.id),
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.PILLAR_OF_FROST, // TO DO: Add support for Gravewarden extension bonus
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.EMPOWER_RUNE_WEAPON, // TO DO Convergence of Fates cd reduction
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.HUNGERING_RUNE_WEAPON_TALENT, // TO DO Convergence of Fates cd reduction
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.HUNGERING_RUNE_WEAPON_TALENT.id),
      extraSuggestion: <span>Normally you should be using this off CD.</span>,
    },
    {
      spell: SPELLS.OBLITERATE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, 
      recommendedCastEfficiency: 0.90,
    },
    {
      spell: SPELLS.REMORSELESS_WINTER,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20, 
      recommendedCastEfficiency: 0.90,
    },
    {
      spell: SPELLS.FROST_STRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, 
      recommendedCastEfficiency: 0.90,
    },
  ];
}

export default CastEfficiency;

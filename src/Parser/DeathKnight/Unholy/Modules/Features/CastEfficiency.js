import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS'
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

// eslint-disable no-unused-vars

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,

    {
      spell: SPELLS.APOCALYPSE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>This is one of your main DPS CDs.  It is okay to not use it immediately if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/>, and <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/> and <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> have less than 10 seconds left on their CDs.</span>,
    },

    {
      spell: SPELLS.DARK_TRANSFORMATION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60, // TODO: add support for shadow infusion
      recommendedCastEfficiency: 0.80,
      extraSuggestion: <span>You should normally be using this off CD, but if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> it is okay to hold if <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/>'s CD has less than 30 seconds left.</span>,
    },

    {
      spell: SPELLS.DARK_ARBITER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120, // TODO: needs to account for CoF
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DARK_ARBITER_TALENT.id),
      extraSuggestion: <span>This is your main DPS CD.  You should be using this as soon as it comes off CD.</span>,
    },

    {
      spell: SPELLS.SUMMON_GARGOYLE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
      extraSuggestion: <span>This is one your main DPS CDs.  You should be using this as soon as it comes off CD.</span>,
    },
  ];
}

export default CastEfficiency;

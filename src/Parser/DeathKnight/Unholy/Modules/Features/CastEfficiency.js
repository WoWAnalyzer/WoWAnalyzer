import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
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
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>This is one of your main DPS cooldown.  It is okay to not use it immediately if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/>, with <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/> and <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> having less than 10 seconds left on their CDs. However <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/> takes priority for being empowered by <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/>. </span>,
    },

    {
      spell: SPELLS.DARK_TRANSFORMATION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60, // TODO: add support for shadow infusion - adding suggestion note to account for difference between Infected Claws and Shadow Infusion as well
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>You should normally be using this off CD, but if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> it is okay to hold if <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/>'s CD has less than 30 seconds remaining.</span>,
    },

    {
      spell: SPELLS.DARK_ARBITER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120, // TODO: needs to account for CoF
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DARK_ARBITER_TALENT.id),
      extraSuggestion: 'This is your main DPS cooldown. Cast this off cooldown, and if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> can be cast immediatly after.',
    },

    {
      spell: SPELLS.SUMMON_GARGOYLE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180, // TODO: needs to account for CoF
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
      extraSuggestion: 'This is your main DPS cooldown.  Cast this off cooldown, if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> can be cast immediatly after.',
    },
  ];
}

export default CastEfficiency;

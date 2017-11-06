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
      extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.APOCALYPSE.id}/> immediately after it's cooldown is up is important, try to plan for it's use as it is coming off cooldown. If you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/>, empowering <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/> with <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> takes priority, so do not worry if an <SpellLink id={SPELLS.APOCALYPSE.id}/> cast is not empowered. </span>,
    },

    {
      spell: SPELLS.DARK_TRANSFORMATION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60, // TODO: add support for shadow infusion - adding suggestion note to account for difference between Infected Claws and Shadow Infusion as well
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>Normally you should be using this off CD, but if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> it is okay to hold if <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id}/>'s CD has less than 30 seconds remaining.</span>,
    },

    {
      spell: SPELLS.DARK_ARBITER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120, // TODO: needs to account for CoF
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DARK_ARBITER_TALENT.id),
      extraSuggestion: <span>This is your main DPS cooldown. Try to cast this off cooldown, keep in mind that if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> that you make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> can be cast immediatly after.'</span>,
    },

    {
      spell: SPELLS.SUMMON_GARGOYLE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180, // TODO: needs to account for CoF
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
      extraSuggestion: 'This is your main DPS cooldown.  Try to cast this off cooldown, keep in mind that if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id}/> that you make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> can be cast immediatly after.',
    },
  ];
}

export default CastEfficiency;

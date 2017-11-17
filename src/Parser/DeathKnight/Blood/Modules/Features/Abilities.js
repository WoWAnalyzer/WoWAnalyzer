import React from 'react';
import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,

    {
      spell: SPELLS.ICEBOUND_FORTITUDE,
      importance: ISSUE_IMPORTANCE.MINOR,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.50,
      extraSuggestion: <span>Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.</span>,

    },
    {
      spell: SPELLS.VAMPIRIC_BLOOD,
      importance: ISSUE_IMPORTANCE.MINOR,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedCastEfficiency: 0.50,
      extraSuggestion: <span>Defensive CDs like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.</span>,
    },

    {
      spell: SPELLS.BLOOD_MIRROR_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedCastEfficiency: 0.75,
      isActive: combatant => combatant.hasTalent(SPELLS.BLOOD_MIRROR_TALENT.id),
      extraSuggestion: <span>Mostly a DPS CD. Use it to reflect large damage back to the boss. It can be used defensively to reduce 20% damage taken for its duration.</span>,
    },

    {
      spell: SPELLS.BLOOD_BOIL,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 7.5 / (1 + haste),
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>Should be casting it so you have at least one recharging.</span>,
    },
    {
      spell: SPELLS.CONSUMPTION,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>Should be casting this on CD for the dps unless your saving the leach for something or saving it for a pack of adds.</span>,
    },

    {
      spell: SPELLS.DANCING_RUNE_WEAPON,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.90,
      extraSuggestion: <span>Should be used as an opener and used on CD for the dps boost.</span>,
    },

    {
      spell: SPELLS.BLOODDRINKER_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      recommendedCastEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
      extraSuggestion: <span>Mostly used as a dps CD. Should be almost casted on CD. Good to use when your running to the boss or cant melee them.</span>,
    },

    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
  ];
}

export default Abilities;

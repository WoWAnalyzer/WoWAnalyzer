import React from 'react';

import SPELLS from 'common/SPELLS';
//import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

//import ItemLink from 'common/ItemLink';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.SINDRAGOSAS_FURY_ARTIFACT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 300,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id} /> immediately after it's cooldown is up is important and if you have 5 stacks of <SpellLink id={SPELLS.RAZORICE.id} /> use as it is coming off cooldown.</span>,
        },
      },
      {
        spell: SPELLS.OBLITERATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.OBLITERATION_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Only save it if you are about to move and will waste more than half the duration.',
        },
      },
      {
        spell: SPELLS.BREATH_OF_SINDRAGOSA_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'You should only save this if you are about to move and would immediately lose the breath.',
        },
      },
      {
        spell: SPELLS.PILLAR_OF_FROST, // TO DO: Add support for Gravewarden extension bonus, Ice Cap reduction
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'You should aim to use this off CD.  Only save it if you are about to move and will waste more than half the duration.',
        },
      },
      {
        spell: SPELLS.EMPOWER_RUNE_WEAPON, // TO DO Convergence of Fates cd reduction
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.60,
          extraSuggestion: <span>You should use this whenever you are out of Runes and Runic Power.  Alternatively, some players use this during heroism to get more casts of <SpellLink id={SPELLS.OBLITERATE.id}/>.</span>,
        },
      },
      {
        spell: SPELLS.HUNGERING_RUNE_WEAPON_TALENT, // TO DO Convergence of Fates cd reduction
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.HUNGERING_RUNE_WEAPON_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.OBLITERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.REMORSELESS_WINTER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FROST_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
    ];
  }
}

export default Abilities;

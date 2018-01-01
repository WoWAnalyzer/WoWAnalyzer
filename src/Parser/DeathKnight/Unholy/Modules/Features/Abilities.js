import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      // roational
      {
        spell: SPELLS.FESTERING_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      {
        spell: SPELLS.SCOURGE_STRIKE,
        enabled: !combatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      {
        spell: SPELLS.CLAWING_SHADOWS_TALENT,
        enabled: combatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      {
        spell: SPELLS.DEATH_COIL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      {
        spell: SPELLS.CHAINS_OF_ICE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasChest(ITEMS.COLD_HEART.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>You should be casting Chains of Ice whenever you have 20 stacks of <SpellLink id={SPELLS.COLD_HEART_BUFF.id} />.</span>,
        },
      },

      {
        spell: SPELLS.DARK_TRANSFORMATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60, // TODO: add support for shadow infusion - adding suggestion note to account for difference between Infected Claws and Shadow Infusion as well
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>Normally you should be using this off CD, but if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} /> it is okay to hold if <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} />'s CD has less than 30 seconds remaining.</span>,
        },
      },

      {
        spell: SPELLS.OUTBREAK,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },

      // cooldowns
      {
        spell: SPELLS.APOCALYPSE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.APOCALYPSE.id} /> immediately after it's cooldown is up is important, try to plan for it's use as it is coming off cooldown. If you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} />, empowering <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} /> with <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> takes priority, so do not worry if an <SpellLink id={SPELLS.APOCALYPSE.id} /> cast is not empowered. </span>,
        },
      },

      {
        spell: SPELLS.SUMMON_GARGOYLE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180, // TODO: needs to account for CoF
        enabled: combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>This is your main DPS cooldown.  Try to cast this off cooldown, keep in mind that if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} /> that you make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> can be cast immediatly after.</span>,
        },
      },

      // talents
      {
        spell: SPELLS.DEFILE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.DEFILE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.DARK_ARBITER_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120, // TODO: needs to account for CoF
        enabled: combatant.hasTalent(SPELLS.DARK_ARBITER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: <span>This is your main DPS cooldown. Try to cast this off cooldown, keep in mind that if you are wearing <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} /> that you make sure <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> can be cast immediatly after.'</span>,
        },
      },

      {
        spell: SPELLS.SOUL_REAPER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.BLIGHTED_RUNE_WEAPON_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.BLIGHTED_RUNE_WEAPON_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.EPIDEMIC_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.EPIDEMIC_TALENT.id),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
    ];
  }
}

export default Abilities;

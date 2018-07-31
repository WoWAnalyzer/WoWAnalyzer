import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // roational
      {
        spell: SPELLS.FESTERING_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.SCOURGE_STRIKE,
        enabled: !combatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.CLAWING_SHADOWS_TALENT,
        enabled: combatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.DEATH_COIL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.CHAINS_OF_ICE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
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
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.OUTBREAK,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      // cooldowns
      {
        spell: SPELLS.APOCALYPSE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <span>Making sure to use <SpellLink id={SPELLS.APOCALYPSE.id} /> immediately after it's cooldown is up is important, try to plan for it's use as it is coming off cooldown.</span>,
        },
      },

      {
        spell: SPELLS.SUMMON_GARGOYLE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180, // TODO: needs to account for CoF
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SUMMON_GARGOYLE_TALENT.id) && (combatant.hasTalent(SPELLS.DEFILE_TALENT.id) || combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id)),
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
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.DEFILE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.SOUL_REAPER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      {
        spell: SPELLS.EPIDEMIC_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10 / (1 + haste),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EPIDEMIC_TALENT.id),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ICEBOUND_FORTITUDE,
        buffSpellId: SPELLS.ICEBOUND_FORTITUDE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: SPELLS.ANTI_MAGIC_SHELL,
        buffSpellId: SPELLS.ANTI_MAGIC_SHELL.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: SPELLS.ARMY_OF_THE_DEAD,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 8 * 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAISE_DEAD,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ASPHYXIATE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_AND_DECAY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_STRIKE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CONTROL_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAISE_ALLY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 600,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WRAITH_WALK_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: combatant.hasTalent(SPELLS.WRAITH_WALK_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEATH_GRIP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.MIND_FREEZE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.DARK_COMMAND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.RUNE_1,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },

      {
        spell: SPELLS.RUNE_2,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },

      {
        spell: SPELLS.RUNE_3,
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        cooldown: (haste, combatantCurrent) => {
          const multiplier = combatantCurrent.hasBuff(SPELLS.RUNIC_CORRUPTION.id) ? 1 : 0;
          return 10 / (1 + haste) / (1 + multiplier);
        },
        charges: 2,
      },
    ];
  }
}

export default Abilities;

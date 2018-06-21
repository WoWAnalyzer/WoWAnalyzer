import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.WAKE_OF_ASHES_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        isOnGCD: true,
        enabled: !combatant.hasShoulder(ITEMS.ASHES_TO_DUST.id) && combatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'It has a high damage per execute time and generates a lot of holy power. It is better to waste 1-2 holy power than to hold the ability. Only hold the ability if adds are coming out in less than 3 seconds',
        },
      },
      {
        spell: SPELLS.WAKE_OF_ASHES_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        isOnGCD: true,
        enabled: combatant.hasShoulder(ITEMS.ASHES_TO_DUST.id) && combatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .95,
          extraSuggestion: <React.Fragment>With <ItemLink id={ITEMS.ASHES_TO_DUST.id} icon /> it is imperative you cast this on cooldown to get the damage bonus.</React.Fragment>,
          importance: ISSUE_IMPORTANCE.MAJOR,
        },
      },
      {
        spell: SPELLS.CRUSADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion: 'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: SPELLS.AVENGING_WRATH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: !combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.CRUSADER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: haste => 6 * 0.85 / (1 + haste),
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.THE_FIRES_OF_JUSTICE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CRUSADER_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: haste => 6 / (1 + haste),
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.THE_FIRES_OF_JUSTICE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        isOnGCD: true,
        enabled: (!combatant.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS.id) && !combatant.hasBuff(SPELLS.RET_PALADIN_T21_2SET_BONUS.id)),
        castEfficiency: {
          suggestion: true,
        },
      },
      //This is the judgment CE with t20/21
      {
        spell: SPELLS.JUDGMENT_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        isOnGCD: true,
        enabled: (combatant.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS.id) || combatant.hasBuff(SPELLS.RET_PALADIN_T21_2SET_BONUS.id)),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <React.Fragment>With tier 20 and tier 21 it is even more important to use <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> on cooldown</React.Fragment>,
        },
      },
      {
        spell: SPELLS.BLADE_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10.5 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_WRATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.HAMMER_OF_WRATH_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.TEMPLARS_VERDICT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DIVINE_STORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.EXECUTION_SENTENCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 20 / (1 + haste),
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CONSECRATION_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 20,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.CONSECRATION_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      //Utility
      {
        spell: SPELLS.SHIELD_OF_VENGEANCE,
        buffSpellId: SPELLS.SHIELD_OF_VENGEANCE.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 120 : 84,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.JUSTICARS_VENGEANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id),
      },
      {
        spell: SPELLS.EYE_FOR_AN_EYE_TALENT,
        buffSpellId: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 60,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EYE_FOR_AN_EYE_TALENT.id),
      },
      {
        spell: SPELLS.WORD_OF_GLORY_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 60,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.WORD_OF_GLORY_TALENT.id),
      },
      {
        spell: SPELLS.BLINDING_LIGHT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.BLINDING_LIGHT_TALENT.id),
      },
      {
        spell: SPELLS.REPENTANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.REPENTANCE_TALENT.id),
      },
      {
        spell: SPELLS.DIVINE_STEED,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT.id) ? 2 : 1,
        cooldown: 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LAY_ON_HANDS,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 600 : 420,
        castEfficiency: {
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION,
        buffSpellId: SPELLS.BLESSING_OF_PROTECTION.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 300,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.HAND_OF_RECKONING,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.DIVINE_SHIELD,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT.id) ? 300 : 210,
        isOnGCD: true, 
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
    ];
  }
}

export default Abilities;

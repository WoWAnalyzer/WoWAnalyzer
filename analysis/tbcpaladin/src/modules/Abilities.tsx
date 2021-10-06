import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.AVENGING_WRATH],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_FREEDOM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_LIGHT, ...lowRankSpells[SPELLS.BLESSING_OF_LIGHT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_MIGHT, ...lowRankSpells[SPELLS.BLESSING_OF_MIGHT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_PROTECTION, ...lowRankSpells[SPELLS.BLESSING_OF_PROTECTION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_SACRIFICE, ...lowRankSpells[SPELLS.BLESSING_OF_SACRIFICE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_SALVATION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_WISDOM, ...lowRankSpells[SPELLS.BLESSING_OF_WISDOM]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLOOD_CORRUPTION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CLEANSE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CONCENTRATION_AURA],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CONSECRATION, ...lowRankSpells[SPELLS.CONSECRATION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CRUSADER_AURA],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEVOTION_AURA, ...lowRankSpells[SPELLS.DEVOTION_AURA]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_INTERVENTION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_PROTECTION, ...lowRankSpells[SPELLS.DIVINE_PROTECTION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_SHIELD, ...lowRankSpells[SPELLS.DIVINE_SHIELD]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EXORCISM, ...lowRankSpells[SPELLS.EXORCISM]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FIRE_RESISTANCE_AURA, ...lowRankSpells[SPELLS.FIRE_RESISTANCE_AURA]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FLASH_OF_LIGHT, ...lowRankSpells[SPELLS.FLASH_OF_LIGHT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FROST_RESISTANCE_AURA, ...lowRankSpells[SPELLS.FROST_RESISTANCE_AURA]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GREATER_BLESSING_OF_KINGS],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_LIGHT,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_LIGHT],
        ],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_MIGHT,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_MIGHT],
        ],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GREATER_BLESSING_OF_SALVATION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_SANCTUARY,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_SANCTUARY],
        ],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_WISDOM,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_WISDOM],
        ],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_JUSTICE, ...lowRankSpells[SPELLS.HAMMER_OF_JUSTICE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_WRATH, ...lowRankSpells[SPELLS.HAMMER_OF_WRATH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOLY_LIGHT, ...lowRankSpells[SPELLS.HOLY_LIGHT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOLY_SHOCK, ...lowRankSpells[SPELLS.HOLY_SHOCK]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOLY_WRATH, ...lowRankSpells[SPELLS.HOLY_WRATH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_CORRUPTION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_THE_CRUSADER],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.LAY_ON_HANDS, ...lowRankSpells[SPELLS.LAY_ON_HANDS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PURIFY],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.REDEMPTION, ...lowRankSpells[SPELLS.REDEMPTION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RETRIBUTION_AURA, ...lowRankSpells[SPELLS.RETRIBUTION_AURA]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_DEFENSE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_FURY],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_BLOOD],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_CORRUPTION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_JUSTICE, ...lowRankSpells[SPELLS.SEAL_OF_JUSTICE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_LIGHT, ...lowRankSpells[SPELLS.SEAL_OF_LIGHT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_RIGHTEOUSNESS, ...lowRankSpells[SPELLS.SEAL_OF_RIGHTEOUSNESS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_THE_CRUSADER, ...lowRankSpells[SPELLS.SEAL_OF_THE_CRUSADER]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_THE_MARTYR, ...lowRankSpells[SPELLS.SEAL_OF_THE_MARTYR]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_VENGEANCE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_WISDOM, ...lowRankSpells[SPELLS.SEAL_OF_WISDOM]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SENSE_UNDEAD],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_RESISTANCE_AURA, ...lowRankSpells[SPELLS.SHADOW_RESISTANCE_AURA]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SPIRITUAL_ATTUNEMENT, ...lowRankSpells[SPELLS.SPIRITUAL_ATTUNEMENT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_CHARGER, ...lowRankSpells[SPELLS.SUMMON_CHARGER]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_WARHORSE, ...lowRankSpells[SPELLS.SUMMON_WARHORSE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.TURN_EVIL],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.TURN_UNDEAD, ...lowRankSpells[SPELLS.TURN_UNDEAD]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

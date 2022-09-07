import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { Build } from '../CONFIG';
import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const build = this.owner.build;
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.CRUSADER_STRIKE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
        cooldown: 6,
        castEfficiency: {
          suggestion: build === Build.RET ? true : false,
          recommendedEfficiency: 0.8,
        },
        enabled: build === Build.RET ? true : false,
      },
      {
        spell: [SPELLS.AVENGING_WRATH],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1500 },
        cooldown: 180,
        castEfficiency: {
          suggestion: build === Build.RET ? true : false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [SPELLS.BLESSING_OF_FREEDOM],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_LIGHT, ...lowRankSpells[SPELLS.BLESSING_OF_LIGHT]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_MIGHT, ...lowRankSpells[SPELLS.BLESSING_OF_MIGHT]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_PROTECTION, ...lowRankSpells[SPELLS.BLESSING_OF_PROTECTION]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_SACRIFICE, ...lowRankSpells[SPELLS.BLESSING_OF_SACRIFICE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_SALVATION],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLESSING_OF_WISDOM, ...lowRankSpells[SPELLS.BLESSING_OF_WISDOM]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLOOD_CORRUPTION],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CLEANSE],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CONCENTRATION_AURA],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CONSECRATION, ...lowRankSpells[SPELLS.CONSECRATION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
        cooldown: 8,
      },
      {
        spell: [SPELLS.CRUSADER_AURA],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEVOTION_AURA, ...lowRankSpells[SPELLS.DEVOTION_AURA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_INTERVENTION],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_PROTECTION, ...lowRankSpells[SPELLS.DIVINE_PROTECTION]],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { static: 1500 },
        cooldown: 300,
      },
      {
        spell: [SPELLS.DIVINE_SHIELD, ...lowRankSpells[SPELLS.DIVINE_SHIELD]],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { static: 1500 },
        cooldown: 300,
      },
      {
        spell: [SPELLS.EXORCISM, ...lowRankSpells[SPELLS.EXORCISM]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FIRE_RESISTANCE_AURA, ...lowRankSpells[SPELLS.FIRE_RESISTANCE_AURA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FLASH_OF_LIGHT, ...lowRankSpells[SPELLS.FLASH_OF_LIGHT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
        enabled: build === Build.DEFAULT ? true : false,
      },
      {
        spell: [SPELLS.FROST_RESISTANCE_AURA, ...lowRankSpells[SPELLS.FROST_RESISTANCE_AURA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GREATER_BLESSING_OF_KINGS],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_LIGHT,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_LIGHT],
        ],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_MIGHT,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_MIGHT],
        ],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GREATER_BLESSING_OF_SALVATION],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_SANCTUARY,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_SANCTUARY],
        ],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [
          SPELLS.GREATER_BLESSING_OF_WISDOM,
          ...lowRankSpells[SPELLS.GREATER_BLESSING_OF_WISDOM],
        ],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_JUSTICE, ...lowRankSpells[SPELLS.HAMMER_OF_JUSTICE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_WRATH, ...lowRankSpells[SPELLS.HAMMER_OF_WRATH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOLY_LIGHT, ...lowRankSpells[SPELLS.HOLY_LIGHT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
        enabled: build === Build.DEFAULT ? true : false,
      },
      {
        spell: [SPELLS.HOLY_SHOCK, ...lowRankSpells[SPELLS.HOLY_SHOCK]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
        enabled: build === Build.DEFAULT ? true : false,
      },
      {
        spell: [SPELLS.HOLY_WRATH, ...lowRankSpells[SPELLS.HOLY_WRATH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_CORRUPTION],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_THE_CRUSADER],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.LAY_ON_HANDS, ...lowRankSpells[SPELLS.LAY_ON_HANDS]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PURIFY],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.REDEMPTION, ...lowRankSpells[SPELLS.REDEMPTION]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RETRIBUTION_AURA, ...lowRankSpells[SPELLS.RETRIBUTION_AURA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_DEFENSE],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_FURY],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_COMMAND, ...lowRankSpells[SPELLS.SEAL_OF_COMMAND]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_BLOOD],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_CORRUPTION],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_JUSTICE, ...lowRankSpells[SPELLS.SEAL_OF_JUSTICE]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_LIGHT, ...lowRankSpells[SPELLS.SEAL_OF_LIGHT]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_RIGHTEOUSNESS, ...lowRankSpells[SPELLS.SEAL_OF_RIGHTEOUSNESS]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_THE_CRUSADER, ...lowRankSpells[SPELLS.SEAL_OF_THE_CRUSADER]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_THE_MARTYR, ...lowRankSpells[SPELLS.SEAL_OF_THE_MARTYR]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_VENGEANCE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_WISDOM, ...lowRankSpells[SPELLS.SEAL_OF_WISDOM]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SENSE_UNDEAD],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_RESISTANCE_AURA, ...lowRankSpells[SPELLS.SHADOW_RESISTANCE_AURA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SPIRITUAL_ATTUNEMENT, ...lowRankSpells[SPELLS.SPIRITUAL_ATTUNEMENT]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_CHARGER, ...lowRankSpells[SPELLS.SUMMON_CHARGER]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_WARHORSE, ...lowRankSpells[SPELLS.SUMMON_WARHORSE]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.TURN_EVIL],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.TURN_UNDEAD, ...lowRankSpells[SPELLS.TURN_UNDEAD]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

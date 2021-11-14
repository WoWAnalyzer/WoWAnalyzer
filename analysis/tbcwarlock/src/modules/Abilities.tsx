import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.BANISH, ...lowRankSpells[SPELLS.BANISH]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CORRUPTION, ...lowRankSpells[SPELLS.CORRUPTION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_FIRESTONE, ...lowRankSpells[SPELLS.CREATE_FIRESTONE]],
        category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_FIRESTONE, ...lowRankSpells[SPELLS.MASTER_FIRESTONE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_HEALTHSTONE, ...lowRankSpells[SPELLS.CREATE_HEALTHSTONE]],
        category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_SOULSTONE, ...lowRankSpells[SPELLS.CREATE_SOULSTONE]],
        category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_SOULSTONE, ...lowRankSpells[SPELLS.MASTER_SOULSTONE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_SPELLSTONE, ...lowRankSpells[SPELLS.CREATE_SPELLSTONE]],
        category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_SPELLSTONE, ...lowRankSpells[SPELLS.MASTER_SPELLSTONE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_AGONY, ...lowRankSpells[SPELLS.CURSE_OF_AGONY]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_DOOM, ...lowRankSpells[SPELLS.CURSE_OF_DOOM]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_RECKLESSNESS, ...lowRankSpells[SPELLS.CURSE_OF_RECKLESSNESS]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_THE_ELEMENTS, ...lowRankSpells[SPELLS.CURSE_OF_THE_ELEMENTS]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_TONGUES, ...lowRankSpells[SPELLS.CURSE_OF_TONGUES]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_WEAKNESS, ...lowRankSpells[SPELLS.CURSE_OF_WEAKNESS]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEATH_COIL, ...lowRankSpells[SPELLS.DEATH_COIL]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMON_ARMOR, ...lowRankSpells[SPELLS.DEMON_ARMOR]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMON_SKIN, ...lowRankSpells[SPELLS.DEMON_SKIN]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_SACRIFICE],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DETECT_INVISIBILITY],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_LIFE, ...lowRankSpells[SPELLS.DRAIN_LIFE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_MANA, ...lowRankSpells[SPELLS.DRAIN_MANA]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_SOUL, ...lowRankSpells[SPELLS.DRAIN_SOUL]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.ENSLAVE_DEMON, ...lowRankSpells[SPELLS.ENSLAVE_DEMON]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EYE_OF_KILROGG],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEAR, ...lowRankSpells[SPELLS.FEAR]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEL_ARMOR, ...lowRankSpells[SPELLS.FEL_ARMOR]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HEALTH_FUNNEL, ...lowRankSpells[SPELLS.HEALTH_FUNNEL]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HELLFIRE, ...lowRankSpells[SPELLS.HELLFIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOWL_OF_TERROR, ...lowRankSpells[SPELLS.HOWL_OF_TERROR]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.IMMOLATE, ...lowRankSpells[SPELLS.IMMOLATE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INCINERATE, ...lowRankSpells[SPELLS.INCINERATE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INFERNO],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.LIFE_TAP, ...lowRankSpells[SPELLS.LIFE_TAP]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RAIN_OF_FIRE, ...lowRankSpells[SPELLS.RAIN_OF_FIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_DOOM],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_SOULS],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_SUMMONING],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEARING_PAIN, ...lowRankSpells[SPELLS.SEARING_PAIN]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEED_OF_CORRUPTION],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SENSE_DEMONS],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_BOLT, ...lowRankSpells[SPELLS.SHADOW_BOLT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_WARD, ...lowRankSpells[SPELLS.SHADOW_WARD]],
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SOUL_FIRE, ...lowRankSpells[SPELLS.SOUL_FIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SOULSHATTER],
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_DREADSTEED],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_FELHUNTER],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_FELSTEED],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_IMP],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_SUCCUBUS],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_VOIDWALKER],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.UNENDING_BREATH],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

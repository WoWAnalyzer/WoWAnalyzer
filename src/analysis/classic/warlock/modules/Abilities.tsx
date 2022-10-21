import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.BANISH, ...lowRankSpells[SPELLS.BANISH]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CHALLENGING_HOWL],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CORRUPTION, ...lowRankSpells[SPELLS.CORRUPTION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_FIRESTONE, ...lowRankSpells[SPELLS.CREATE_FIRESTONE]],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_FIRESTONE, ...lowRankSpells[SPELLS.MASTER_FIRESTONE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_HEALTHSTONE, ...lowRankSpells[SPELLS.CREATE_HEALTHSTONE]],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_SOULSTONE, ...lowRankSpells[SPELLS.CREATE_SOULSTONE]],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_SOULSTONE, ...lowRankSpells[SPELLS.MASTER_SOULSTONE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CREATE_SPELLSTONE, ...lowRankSpells[SPELLS.CREATE_SPELLSTONE]],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MASTER_SPELLSTONE, ...lowRankSpells[SPELLS.MASTER_SPELLSTONE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_AGONY, ...lowRankSpells[SPELLS.CURSE_OF_AGONY]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_DOOM, ...lowRankSpells[SPELLS.CURSE_OF_DOOM]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_THE_ELEMENTS, ...lowRankSpells[SPELLS.CURSE_OF_THE_ELEMENTS]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_TONGUES, ...lowRankSpells[SPELLS.CURSE_OF_TONGUES]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CURSE_OF_WEAKNESS, ...lowRankSpells[SPELLS.CURSE_OF_WEAKNESS]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEATH_COIL, ...lowRankSpells[SPELLS.DEATH_COIL]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMON_ARMOR, ...lowRankSpells[SPELLS.DEMON_ARMOR]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMON_SKIN, ...lowRankSpells[SPELLS.DEMON_SKIN]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_CIRCLE_SUMMON],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_CIRCLE_TELEPORT],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_EMPOWERMENT],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_IMMOLATE],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEMONIC_SACRIFICE],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DETECT_INVISIBILITY],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_LIFE, ...lowRankSpells[SPELLS.DRAIN_LIFE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_MANA],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DRAIN_SOUL, ...lowRankSpells[SPELLS.DRAIN_SOUL]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EYE_OF_KILROGG],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEAR, ...lowRankSpells[SPELLS.FEAR]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEL_ARMOR, ...lowRankSpells[SPELLS.FEL_ARMOR]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HAUNT, ...lowRankSpells[SPELLS.HAUNT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HEALTH_FUNNEL, ...lowRankSpells[SPELLS.HEALTH_FUNNEL]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HELLFIRE, ...lowRankSpells[SPELLS.HELLFIRE]],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.HOWL_OF_TERROR, ...lowRankSpells[SPELLS.HOWL_OF_TERROR]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.IMMOLATE, ...lowRankSpells[SPELLS.IMMOLATE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.IMMOLATION_AURA],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INCINERATE, ...lowRankSpells[SPELLS.INCINERATE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INFERNO],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.LIFE_TAP, ...lowRankSpells[SPELLS.LIFE_TAP]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.METAMORPHOSIS],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RAIN_OF_FIRE, ...lowRankSpells[SPELLS.RAIN_OF_FIRE]],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_DOOM],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_SOULS, ...lowRankSpells[SPELLS.RITUAL_OF_SOULS]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RITUAL_OF_SUMMONING],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEARING_PAIN, ...lowRankSpells[SPELLS.SEARING_PAIN]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SEED_OF_CORRUPTION],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SENSE_DEMONS],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_BOLT, ...lowRankSpells[SPELLS.SHADOW_BOLT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_CLEAVE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_WARD, ...lowRankSpells[SPELLS.SHADOW_WARD]],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHADOWFLAME, ...lowRankSpells[SPELLS.SHADOWFLAME]],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SOUL_FIRE, ...lowRankSpells[SPELLS.SOUL_FIRE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SOULSHATTER],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUBJUGATE_DEMON, ...lowRankSpells[SPELLS.SUBJUGATE_DEMON]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_DREADSTEED],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_FELHUNTER],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_FELSTEED],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_IMP],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_INCUBUS],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_SUCCUBUS],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SUMMON_VOIDWALKER],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.UNENDING_BREATH],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.UNSTABLE_AFFLICTION, ...lowRankSpells[SPELLS.UNSTABLE_AFFLICTION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

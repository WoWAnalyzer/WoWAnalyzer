import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.AMBUSH, ...lowRankSpells[SPELLS.AMBUSH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.ANESTHETIC_POISON, ...lowRankSpells[SPELLS.ANESTHETIC_POISON]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BACKSTAB, ...lowRankSpells[SPELLS.BACKSTAB]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLIND],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CHEAP_SHOT],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CLOAK_OF_SHADOWS],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CRIPPLING_POISON_II, ...lowRankSpells[SPELLS.CRIPPLING_POISON_II]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEADLY_POISON_VII, ...lowRankSpells[SPELLS.DEADLY_POISON_VII]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEADLY_THROW],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DETECT_TRAPS],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DISARM_TRAP],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DISTRACT],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.ENVENOM, ...lowRankSpells[SPELLS.ENVENOM]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EVASION, ...lowRankSpells[SPELLS.EVASION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EVISCERATE, ...lowRankSpells[SPELLS.EVISCERATE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EXPOSE_ARMOR, ...lowRankSpells[SPELLS.EXPOSE_ARMOR]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEINT, ...lowRankSpells[SPELLS.FEINT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FIND_WEAKNESS, ...lowRankSpells[SPELLS.FIND_WEAKNESS]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GARROTE, ...lowRankSpells[SPELLS.GARROTE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GOUGE, ...lowRankSpells[SPELLS.GOUGE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INSTANT_POISON_VII, ...lowRankSpells[SPELLS.INSTANT_POISON_VII]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.KICK, ...lowRankSpells[SPELLS.KICK]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.KIDNEY_SHOT, ...lowRankSpells[SPELLS.KIDNEY_SHOT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MIND_NUMBING_POISON_III, ...lowRankSpells[SPELLS.MIND_NUMBING_POISON_III]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MUTILATE, ...lowRankSpells[SPELLS.MUTILATE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PICK_LOCK],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PICK_POCKET],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.POISONS],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RUPTURE, ...lowRankSpells[SPELLS.RUPTURE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SAFE_FALL],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SAP, ...lowRankSpells[SPELLS.SAP]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHIV],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SINISTER_STRIKE, ...lowRankSpells[SPELLS.SINISTER_STRIKE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SLICE_AND_DICE, ...lowRankSpells[SPELLS.SLICE_AND_DICE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SPRINT, ...lowRankSpells[SPELLS.SPRINT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.STEALTH, ...lowRankSpells[SPELLS.STEALTH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.VANISH, ...lowRankSpells[SPELLS.VANISH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.WOUND_POISON_V, ...lowRankSpells[SPELLS.WOUND_POISON_V]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

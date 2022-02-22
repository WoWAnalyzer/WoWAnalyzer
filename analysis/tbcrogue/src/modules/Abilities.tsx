import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.AMBUSH, ...lowRankSpells[SPELLS.AMBUSH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.ANESTHETIC_POISON, ...lowRankSpells[SPELLS.ANESTHETIC_POISON]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BACKSTAB, ...lowRankSpells[SPELLS.BACKSTAB]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.BLIND],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CHEAP_SHOT],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CLOAK_OF_SHADOWS],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.CRIPPLING_POISON_II, ...lowRankSpells[SPELLS.CRIPPLING_POISON_II]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEADLY_POISON_VII, ...lowRankSpells[SPELLS.DEADLY_POISON_VII]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DEADLY_THROW],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DETECT_TRAPS],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DISARM_TRAP],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.DISTRACT],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.ENVENOM, ...lowRankSpells[SPELLS.ENVENOM]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EVASION, ...lowRankSpells[SPELLS.EVASION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EVISCERATE, ...lowRankSpells[SPELLS.EVISCERATE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.EXPOSE_ARMOR, ...lowRankSpells[SPELLS.EXPOSE_ARMOR]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FEINT, ...lowRankSpells[SPELLS.FEINT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.FIND_WEAKNESS, ...lowRankSpells[SPELLS.FIND_WEAKNESS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GARROTE, ...lowRankSpells[SPELLS.GARROTE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.GOUGE, ...lowRankSpells[SPELLS.GOUGE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.INSTANT_POISON_VII, ...lowRankSpells[SPELLS.INSTANT_POISON_VII]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.KICK, ...lowRankSpells[SPELLS.KICK]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.KIDNEY_SHOT, ...lowRankSpells[SPELLS.KIDNEY_SHOT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MIND_NUMBING_POISON_III, ...lowRankSpells[SPELLS.MIND_NUMBING_POISON_III]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.MUTILATE, ...lowRankSpells[SPELLS.MUTILATE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PICK_LOCK],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.PICK_POCKET],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.POISONS],
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.RUPTURE, ...lowRankSpells[SPELLS.RUPTURE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SAFE_FALL],
        category: Abilities.SPELL_CATEGORIES.HIDDEN,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SAP, ...lowRankSpells[SPELLS.SAP]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SHIV],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SINISTER_STRIKE, ...lowRankSpells[SPELLS.SINISTER_STRIKE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SLICE_AND_DICE, ...lowRankSpells[SPELLS.SLICE_AND_DICE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.SPRINT, ...lowRankSpells[SPELLS.SPRINT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.STEALTH, ...lowRankSpells[SPELLS.STEALTH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.VANISH, ...lowRankSpells[SPELLS.VANISH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
      {
        spell: [SPELLS.WOUND_POISON_V, ...lowRankSpells[SPELLS.WOUND_POISON_V]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: { static: 1500 },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;

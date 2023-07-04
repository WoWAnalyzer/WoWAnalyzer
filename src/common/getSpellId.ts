import Spell, { isSpell } from 'common/SPELLS/Spell';
import { Ability, isAbility } from 'parser/core/Events';

export const getSpellId = (spell: number | Spell | Ability): number => {
  if (isSpell(spell)) {
    return spell.id;
  }
  if (isAbility(spell)) {
    return spell.guid;
  }
  return spell;
};

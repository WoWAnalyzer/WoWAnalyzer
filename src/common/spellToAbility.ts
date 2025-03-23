import { Ability } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { maybeGetTalentOrSpell } from './maybeGetTalentOrSpell';

export const spellToAbility = (
  spell: Spell | number,
  type: number = MAGIC_SCHOOLS.ids.PHYSICAL,
): Ability | undefined => {
  if (typeof spell === 'number') {
    spell = maybeGetTalentOrSpell(spell)!;
  }
  if (typeof spell === 'undefined') {
    return undefined;
  }
  return {
    guid: spell.id,
    name: spell.name,
    abilityIcon: `${spell.icon}.jpg`,
    type: type,
  };
};

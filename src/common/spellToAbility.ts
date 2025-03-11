import { Ability } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

export const spellToAbility = (
  spell: Spell,
  type: number = MAGIC_SCHOOLS.ids.PHYSICAL,
): Ability => ({
  guid: spell.id,
  name: spell.name,
  abilityIcon: `${spell.icon}.jpg`,
  type: type,
});

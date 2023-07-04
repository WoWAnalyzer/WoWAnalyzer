import { Ability } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';

export const abilityToSpell = (ability: Ability): Spell => ({
  id: ability.guid,
  name: ability.name,
  icon: ability.abilityIcon.replace('.jpg', ''),
});

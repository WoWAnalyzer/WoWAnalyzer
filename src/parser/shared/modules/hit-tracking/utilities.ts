import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { DamageEvent } from 'parser/core/Events';
import Enemies, { encodeEventSourceString } from 'parser/shared/modules/Enemies';

import IgnoredAbilities from './IgnoredAbilities';

export function notableEnemy(enemies: Enemies, event: DamageEvent): boolean {
  const enemyId = encodeEventSourceString(event);
  if (!enemyId) {
    return false;
  }

  return !event.sourceIsFriendly && enemies.getEntities()[enemyId] !== undefined;
}

export function magic(event: DamageEvent): boolean {
  return event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL;
}

export function shouldIgnore(enemies: Enemies, event: DamageEvent): boolean {
  return (
    !notableEnemy(enemies, event) ||
    IgnoredAbilities.includes(event.ability.guid) ||
    event.tick === true
  );
}

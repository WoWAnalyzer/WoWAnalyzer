import Enemies from 'parser/shared/modules/Enemies';
import { DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

import IgnoredAbilities from './IgnoredAbilities';

export function notableEnemy(enemies: Enemies, event: DamageEvent): boolean {
    return !event.sourceIsFriendly && event.sourceID !== undefined && enemies.getEntities()[event.sourceID] !== undefined;
}

export function magic(event: DamageEvent): boolean {
    return event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL;
}

export function shouldIgnore(enemies: Enemies, event: DamageEvent): boolean {
    return !notableEnemy(enemies, event) || IgnoredAbilities.includes(event.ability.guid);
}

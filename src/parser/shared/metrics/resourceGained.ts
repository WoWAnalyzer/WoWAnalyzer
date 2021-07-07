import { AnyEvent, EventType } from 'parser/core/Events';
import metric from 'parser/core/metric';

interface ResourcesGained {
  [targetId: number]: {
    [resourceTypeId: number]: {
      [spellId: number]: number;
    };
  };
}

/**
 * Returns an object with the total resource gained per resource.
 */
const resourceGained = (events: AnyEvent[]) =>
  events.reduce<ResourcesGained>((obj, event) => {
    if (event.type === EventType.Energize) {
      obj[event.targetID] = obj[event.targetID] || {};
      obj[event.targetID][event.resourceChangeType] =
        obj[event.targetID][event.resourceChangeType] || {};
      obj[event.targetID][event.resourceChangeType][event.ability.guid] =
        (obj[event.targetID][event.resourceChangeType][event.ability.guid] ?? 0) +
        (event.resourceChange - event.waste);
    }
    return obj;
  }, {});

export default metric(resourceGained);

export const sumResourceGained = (
  resourcesGained: ResourcesGained,
  playerId: number,
  resourceId: number,
) =>
  Object.values(resourcesGained[playerId]?.[resourceId]).reduce((sum, item) => sum + item, 0) || 0;
export const sumResourceGainedBySpell = (
  resourcesGained: ResourcesGained,
  playerId: number,
  resourceId: number,
  spellId: number,
) => resourcesGained[playerId]?.[resourceId]?.[spellId] || 0;

import { MappedEvent, EventType } from 'parser/core/Events';
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
const resourceGained = (events: MappedEvent[]) =>
  events.reduce<ResourcesGained>((obj, event) => {
    if (event.type === EventType.ResourceChange) {
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
  resourceId: number,
  playerId: number,
) =>
  Object.values(resourcesGained[playerId]?.[resourceId]).reduce((sum, item) => sum + item, 0) || 0;
export const sumResourceGainedByPlayerBySpell = (
  resourcesGained: ResourcesGained,
  resourceId: number,
  playerId: number,
  spellId: number,
) => resourcesGained[playerId]?.[resourceId]?.[spellId] || 0;
export const sumResourceGainedByPlayerPerSpell = (
  resourcesGained: ResourcesGained,
  resourceId: number,
  playerId: number,
) => resourcesGained[playerId]?.[resourceId];
export const sumResourceGainedBySpell = (
  resourcesGained: ResourcesGained,
  resourceId: number,
  spellId: number,
) =>
  Object.values(resourcesGained)
    .map((obj) => obj[resourceId]?.[spellId] || 0)
    .reduce((a, b) => a + b, 0);

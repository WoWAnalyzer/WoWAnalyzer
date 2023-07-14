import { MappedEvent, EventType } from 'parser/core/Events';
import metric from 'parser/core/metric';

interface ResourcesWasted {
  [targetId: number]: {
    [resourceTypeId: number]: {
      [spellId: number]: number;
    };
  };
}

/**
 * Returns an object with the total resource wasted per resource.
 */
const resourceWasted = (events: MappedEvent[]) =>
  events.reduce<ResourcesWasted>((obj, event) => {
    if (event.type === EventType.ResourceChange) {
      obj[event.targetID] = obj[event.targetID] || {};
      obj[event.targetID][event.resourceChangeType] =
        obj[event.targetID][event.resourceChangeType] || {};
      obj[event.targetID][event.resourceChangeType][event.ability.guid] =
        (obj[event.targetID][event.resourceChangeType][event.ability.guid] ?? 0) + event.waste;
    }
    return obj;
  }, {});

export default metric(resourceWasted);

export const sumResourceWasted = (
  resourcesWasted: ResourcesWasted,
  resourceId: number,
  playerId: number,
) =>
  Object.values(resourcesWasted[playerId]?.[resourceId]).reduce((sum, item) => sum + item, 0) || 0;
export const sumResourceWastedByPlayerBySpell = (
  resourcesWasted: ResourcesWasted,
  resourceId: number,
  playerId: number,
  spellId: number,
) => resourcesWasted[playerId]?.[resourceId]?.[spellId] || 0;
export const sumResourceWastedByPlayerPerSpell = (
  resourcesWasted: ResourcesWasted,
  resourceId: number,
  playerId: number,
) => resourcesWasted[playerId]?.[resourceId];
export const sumResourceWastedBySpell = (
  resourcesWasted: ResourcesWasted,
  resourceId: number,
  spellId: number,
) =>
  Object.values(resourcesWasted)
    .map((obj) => obj[resourceId]?.[spellId] || 0)
    .reduce((a, b) => a + b, 0);

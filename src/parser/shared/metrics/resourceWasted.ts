import { AnyEvent, EventType } from 'parser/core/Events';
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
const resourceWasted = (events: AnyEvent[], playerId: number) =>
  events.reduce<ResourcesWasted>((obj, event) => {
    if (event.type === EventType.Energize) {
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
  playerId: number,
  resourceId: number,
) =>
  Object.values(resourcesWasted[playerId]?.[resourceId]).reduce((sum, item) => sum + item, 0) || 0;
export const sumResourceWastedBySpell = (
  resourcesWasted: ResourcesWasted,
  playerId: number,
  resourceId: number,
  spellId: number,
) => resourcesWasted[playerId]?.[resourceId]?.[spellId] || 0;

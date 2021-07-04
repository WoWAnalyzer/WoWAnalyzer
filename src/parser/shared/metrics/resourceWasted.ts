import { AnyEvent, EventType } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';

/**
 * Returns an object with the total resource wasted per resource.
 */
const resourceWasted = (events: AnyEvent[], { playerId }: Info) =>
  events.reduce<{
    [resourceTypeId: number]: {
      [spellId: number]: number;
    };
  }>((obj, event) => {
    if (event.type === EventType.Energize && event.targetID === playerId) {
      obj[event.resourceChangeType] = obj[event.resourceChangeType] || {};
      obj[event.resourceChangeType][event.ability.guid] =
        (obj[event.resourceChangeType][event.ability.guid] ?? 0) + event.waste;
    }
    return obj;
  }, {});

export default metric(resourceWasted);

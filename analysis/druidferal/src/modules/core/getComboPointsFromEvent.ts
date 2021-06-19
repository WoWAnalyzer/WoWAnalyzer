import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { CastEvent } from 'parser/core/Events';

const debug = false;

// TODO deprecated, switch to ResourceFromEvent
export default function getComboPointsFromEvent(event: CastEvent): number {
  if (!event || !event.classResources) {
    debug && console.warn('castEvent is null or without a classResources property.');
    return 0;
  }
  const resource = event.classResources.find(
    (item) => item.type === RESOURCE_TYPES.COMBO_POINTS.id,
  );
  if (!resource) {
    debug && console.warn("castEvent classResources property doesn't have combo points listed.");
    return 0;
  }
  return resource.amount;
}

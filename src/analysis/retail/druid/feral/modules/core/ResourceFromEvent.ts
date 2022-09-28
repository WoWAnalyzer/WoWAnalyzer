import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { CastEvent } from 'parser/core/Events';

// TODO deprecated, switch to ResourceFromEvent - remove for DF!
export function getComboPointsSpent(event: CastEvent): number {
  return getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS.id);
}

export function getEnergySpent(event: CastEvent): number {
  return getResourceSpent(event, RESOURCE_TYPES.ENERGY.id);
}

function getResourceSpent(event: CastEvent, resourceId: number): number {
  if (!event || !event.classResources) {
    return 0;
  }
  const resource = event.classResources.find((res) => res.type === resourceId);
  if (!resource) {
    return 0;
  }
  return resource.cost || 0;
}

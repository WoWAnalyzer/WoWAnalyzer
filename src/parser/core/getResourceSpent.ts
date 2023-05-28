import { CastEvent } from 'parser/core/Events';
import { Resource } from 'game/RESOURCE_TYPES';

/** Returns the amount of resource spent by a cast event, returning zero if the
 *  resource isn't included in classResources.
 * @param event the event to get resource cost from
 * @param resource the resource to check. See {@link RESOURCE_TYPES}
 * @return the amount of the resource spent
 */
function getResourceSpent(event: CastEvent, resource: Resource): number {
  if (!event.classResources) {
    return 0;
  }
  const classResource = event.classResources.find((res) => res.type === resource.id);
  return !classResource ? 0 : classResource.cost || 0;
}

export default getResourceSpent;

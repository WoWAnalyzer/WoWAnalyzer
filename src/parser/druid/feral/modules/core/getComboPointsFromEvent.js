import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const debug = false;

export default function getComboPointsFromEvent(castEvent) {
  if (!castEvent || !castEvent.classResources) {
    debug && this.warn('castEvent is null or without a classResources property.');
    return 0;
  }
  const resource = castEvent.classResources.find(item => item.type === RESOURCE_TYPES.COMBO_POINTS.id);
  if (!resource) {
    debug && this.warn('castEvent classResources property doesn\'t have combo points listed.');
    return 0;
  }
  return resource.amount;
}

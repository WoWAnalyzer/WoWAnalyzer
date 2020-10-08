import ResourceUsage from 'parser/shared/modules/resources/ResourceUsage';
import { LIST_OF_FOCUS_SPENDERS_SHARED } from 'parser/hunter/shared/constants';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class FocusUsage extends ResourceUsage {

  static resourceType = RESOURCE_TYPES.FOCUS;

  static listOfResourceSpenders: { id: number, name: string, icon: string }[] = [
    ...LIST_OF_FOCUS_SPENDERS_SHARED,
  ];

}

export default FocusUsage;

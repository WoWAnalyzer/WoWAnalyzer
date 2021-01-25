import ResourceUsage from 'parser/shared/modules/resources/ResourceUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';

import { LIST_OF_FOCUS_SPENDERS_SHARED } from './constants';

class FocusUsage extends ResourceUsage {

  static resourceType = RESOURCE_TYPES.FOCUS;

  static listOfResourceSpenders: Spell[] = [
    ...LIST_OF_FOCUS_SPENDERS_SHARED,
  ];

}

export default FocusUsage;

import Spell from 'common/SPELLS/Spell';

import { FocusUsage as SharedHunterFocusUsage } from '@wowanalyzer/hunter';
import { LIST_OF_FOCUS_SPENDERS_BM } from '@wowanalyzer/hunter-beastmastery/src/constants';

class BeastMasteryFocusUsage extends SharedHunterFocusUsage {
  static listOfResourceSpenders: Spell[] = [...LIST_OF_FOCUS_SPENDERS_BM];
}

export default BeastMasteryFocusUsage;

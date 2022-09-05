import { FocusUsage as SharedHunterFocusUsage } from 'analysis/retail/hunter';
import { LIST_OF_FOCUS_SPENDERS_BM } from 'analysis/retail/hunter-beastmastery/constants';
import Spell from 'common/SPELLS/Spell';

class BeastMasteryFocusUsage extends SharedHunterFocusUsage {
  static listOfResourceSpenders: Spell[] = [...LIST_OF_FOCUS_SPENDERS_BM];
}

export default BeastMasteryFocusUsage;

import { LIST_OF_FOCUS_SPENDERS_MM } from 'analysis/retail/hunter/marksmanship/constants';
import { FocusUsage as SharedHunterFocusUsage } from 'analysis/retail/hunter/shared';
import Spell from 'common/SPELLS/Spell';

class MarksmanshipFocusUsage extends SharedHunterFocusUsage {
  static listOfResourceSpenders: Spell[] = [...LIST_OF_FOCUS_SPENDERS_MM];
}

export default MarksmanshipFocusUsage;

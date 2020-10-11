import SharedHunterFocusUsage from 'parser/hunter/shared/modules/resources/FocusUsage';
import { LIST_OF_FOCUS_SPENDERS_MM } from 'parser/hunter/marksmanship/constants';
import Spell from 'common/SPELLS/Spell';

class MarksmanshipFocusUsage extends SharedHunterFocusUsage {

  static listOfResourceSpenders: Spell[] = [
    ...LIST_OF_FOCUS_SPENDERS_MM,
  ];

}

export default MarksmanshipFocusUsage;

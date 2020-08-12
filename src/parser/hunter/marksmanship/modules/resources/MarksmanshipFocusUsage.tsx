import SharedHunterFocusUsage from 'parser/hunter/shared/modules/resources/FocusUsage';
import { LIST_OF_FOCUS_SPENDERS_MM } from 'parser/hunter/marksmanship/constants';

class MarksmanshipFocusUsage extends SharedHunterFocusUsage {

  static listOfResourceSpenders: { id: number, name: string, icon: string }[] = [
    ...LIST_OF_FOCUS_SPENDERS_MM,
  ];

}

export default MarksmanshipFocusUsage;

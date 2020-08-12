import SharedHunterFocusUsage from 'parser/hunter/shared/modules/resources/FocusUsage';
import { LIST_OF_FOCUS_SPENDERS_BM } from 'parser/hunter/beastmastery/constants';

class BeastMasteryFocusUsage extends SharedHunterFocusUsage {

  static listOfResourceSpenders: { id: number, name: string, icon: string }[] = [
    ...LIST_OF_FOCUS_SPENDERS_BM,
  ];

}

export default BeastMasteryFocusUsage;

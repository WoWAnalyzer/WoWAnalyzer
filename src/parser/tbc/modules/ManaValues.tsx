import ManaValues from 'parser/shared/modules/ManaValues';
import { Options } from 'parser/core/Analyzer';

class TbcManaValues extends ManaValues {
  constructor(options: Options) {
    super(options);
    this.active = true;
  }
}

export default TbcManaValues;

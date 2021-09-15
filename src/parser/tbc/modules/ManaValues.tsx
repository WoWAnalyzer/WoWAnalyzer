import { Options } from 'parser/core/Analyzer';
import ManaValues from 'parser/shared/modules/ManaValues';

class TbcManaValues extends ManaValues {
  constructor(options: Options) {
    super(options);
    this.active = true;
  }
}

export default TbcManaValues;

import { Options } from 'parser/core/Analyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import ROLES from 'game/ROLES';

class ClassicManaValues extends ManaValues {
  constructor(options: Options) {
    super(options);
    this.active = this.config.spec.role === ROLES.HEALER;
  }
}

export default ClassicManaValues;

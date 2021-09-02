import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import { Options } from 'parser/core/Analyzer';
import BaseManaValues from 'parser/shared/modules/ManaValues';

class ManaValues extends BaseManaValues {
  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.spec?.role === ROLES.HEALER &&
      this.selectedCombatant.spec !== SPECS.HOLY_PALADIN;
  }
}

export default ManaValues;

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';

import Empowerment from './Empowerment';

class LunarEmpowerment extends Empowerment {

  empowermentBuff = SPELLS.LUNAR_EMP_BUFF;
  statisticOrder = STATISTIC_ORDER.CORE(5);

  constructor(...args) {
    super(...args);
    this.empoweredSpell = SPELLS.LUNAR_STRIKE;
    this.empowermentPrefix = 'Lunar';
    this.spellGenerateAmount = 12;
    this.icon = 'ability_druid_eclipse';
  }
}

export default LunarEmpowerment;

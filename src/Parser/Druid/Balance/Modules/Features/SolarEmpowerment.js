import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Empowerment from './Empowerment';

class SolarEmpowerment extends Empowerment {

  on_initialized() {
    super.on_initialized();
    this.empoweredSpell = SPELLS.SOLAR_WRATH_MOONKIN;
    this.empowermentPrefix = 'Solar';
    this.spellGenerateAmount = 8;
    this.icon = 'ability_druid_eclipseorange';
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default SolarEmpowerment;

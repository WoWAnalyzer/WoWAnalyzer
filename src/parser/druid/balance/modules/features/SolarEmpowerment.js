import SPELLS from 'common/SPELLS';
import Empowerment from './Empowerment';

class SolarEmpowerment extends Empowerment {

  constructor(...args) {
    super(...args);
    this.empowermentBuff = SPELLS.SOLAR_EMP_BUFF;
    this.empoweredSpell = SPELLS.SOLAR_WRATH_MOONKIN;
    this.empowermentPrefix = 'Solar';
    this.spellGenerateAmount = 8;
    this.icon = 'ability_druid_eclipseorange';
  }
}

export default SolarEmpowerment;

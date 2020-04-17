import SPELLS from 'common/SPELLS';
import Empowerment from './Empowerment';

class LunarEmpowerment extends Empowerment {

  constructor(...args) {
    super(...args);
    this.empowermentBuff = SPELLS.LUNAR_EMP_BUFF;
    this.empoweredSpell = SPELLS.LUNAR_STRIKE;
    this.empowermentPrefix = 'Lunar';
    this.spellGenerateAmount = 12;
    this.icon = 'ability_druid_eclipse';
  }
}

export default LunarEmpowerment;

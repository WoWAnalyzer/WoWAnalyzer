import SPELLS from 'common/SPELLS';
import EmpowermentNormalizer from './EmpowermentNormalizer';

class SolarEmpowermentNormalizer extends EmpowermentNormalizer {

  constructor(...args) {
    super(...args);
    this.empowermentBuff = SPELLS.SOLAR_EMP_BUFF;
  }
  
}

export default SolarEmpowermentNormalizer;

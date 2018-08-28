import SPELLS from 'common/SPELLS';
import EmpowermentNormalizer from './EmpowermentNormalizer';

class LunarEmpowermentNormalizer extends EmpowermentNormalizer {

  constructor(...args) {
    super(...args);
    this.empowermentBuff = SPELLS.LUNAR_EMP_BUFF;
  }
  
}

export default LunarEmpowermentNormalizer;

import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS';

class Haste extends CoreHaste {
  hasteBuffOverrides = {
    [SPELLS.INTO_THE_FRAY_BUFF.id]: {
      // from Into the Fray (2% per stack for each enemy nearby)
      hastePerStack: 0.02,
    },
  };
}

export default Haste;

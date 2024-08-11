import SPELLS from 'common/SPELLS';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    // Shaman specific
    [SPELLS.UNLIMITED_POWER_BUFF.id]: {
      hastePerStack: 0.02,
    },
    [SPELLS.TAILWIND_TOTEM.id]: 0.02,
  };
}

export default Haste;

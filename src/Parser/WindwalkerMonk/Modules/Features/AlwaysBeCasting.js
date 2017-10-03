import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.BLACKOUT_KICK.id,
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.TIGER_PALM.id,

  ];
}

export default AlwaysBeCasting;

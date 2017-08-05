import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Guardian:
    SPELLS.MANGLE_BEAR.id,
    SPELLS.THRASH_BEAR.id,
    SPELLS.BEAR_SWIPE.id,
    SPELLS.MOONFIRE.id,
    SPELLS.MAUL.id,
    // To Do: Complete list of spells.
  ];
}

export default AlwaysBeCasting;
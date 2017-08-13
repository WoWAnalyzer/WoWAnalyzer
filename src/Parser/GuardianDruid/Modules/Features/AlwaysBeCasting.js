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
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.INCAPACITATING_ROAR.id,
    SPELLS.STAMPEDING_ROAR_BEAR.id,
    SPELLS.STAMPEDING_ROAR_CAT.id,
    
    // Talents
    SPELLS.INTIMIDATING_ROAR_TALENT.id,
    SPELLS.TYPHOON.id,
    SPELLS.PULVERIZE_TALENT.id,
    SPELLS.MIGHTY_BASH.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,
    SPELLS.WILD_CHARGE_TALENT.id,
  ];
}

export default AlwaysBeCasting;

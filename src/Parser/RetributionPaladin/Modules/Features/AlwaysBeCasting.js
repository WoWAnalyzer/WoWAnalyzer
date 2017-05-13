import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Retribution:
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CRUSADER_STRIKE.id,
    SPELLS.TEMPLARS_VERDICT.id,
    SPELLS.DIVINE_HAMMER_TALENT.id,
    SPELLS.DIVINE_STORM.id,
    SPELLS.WAKE_OF_ASHES.id,
    SPELLS.SHIELD_OF_VENGEANCE.id,

    // Paladin:
    SPELLS.DIVINE_STEED.id,
    SPELLS.BLINDING_LIGHT_TALENT.id,
    642, // Divine Shield
    SPELLS.LAY_ON_HANDS.id,
    SPELLS.BLESSING_OF_FREEDOM.id,
    853, // Hammer of Justice
    SPELLS.HAND_OF_RECKONING.id,
    SPELLS.FLASH_OF_LIGHT.id,

    // Items:
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
  ];
}

export default AlwaysBeCasting;

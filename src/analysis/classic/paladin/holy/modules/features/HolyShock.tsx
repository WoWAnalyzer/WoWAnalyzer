import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/paladin';

class HolyShock extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HOLY_LIGHT.id,
  ];
}

export default HolyShock;

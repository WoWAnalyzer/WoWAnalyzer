import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/druid';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.HEALING_TOUCH.id,
    SPELLS.LIFEBLOOM.id,
    SPELLS.NOURISH.id,
    SPELLS.REGROWTH.id,
    SPELLS.REJUVENATION.id,
    SPELLS.SWIFTMEND.id,
    SPELLS.TRANQUILITY.id,
    SPELLS.WILD_GROWTH.id,
  ];
}

export default AlwaysBeCasting;

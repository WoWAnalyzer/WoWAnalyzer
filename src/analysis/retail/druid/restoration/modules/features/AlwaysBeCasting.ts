import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { TALENTS_DRUID } from 'common/TALENTS';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.REJUVENATION.id,
    SPELLS.REGROWTH.id,
    SPELLS.WILD_GROWTH.id,
    SPELLS.TRANQUILITY_CAST.id,
    TALENTS_DRUID.CENARION_WARD_TALENT.id,
    SPELLS.LIFEBLOOM_HOT_HEAL.id,
    SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
    SPELLS.SWIFTMEND.id,
    TALENTS_DRUID.FLOURISH_TALENT.id,
    SPELLS.EFFLORESCENCE_CAST.id,
    SPELLS.NATURES_CURE.id,
    TALENTS_DRUID.NOURISH_TALENT.id,
  ];
}

export default AlwaysBeCasting;

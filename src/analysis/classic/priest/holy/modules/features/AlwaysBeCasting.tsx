import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.RENEW.id,
    SPELLS.CIRCLE_OF_HEALING.id,
    SPELLS.PRAYER_OF_MENDING.id,
    SPELLS.PRAYER_OF_HEALING.id,
    SPELLS.FLASH_HEAL.id,
    SPELLS.FLASH_HEAL_SURGE_OF_LIGHT.id,
    SPELLS.HEAL.id,
    SPELLS.DIVINE_HYMN.id,
    SPELLS.HOLY_WORD_SANCTUARY.id,
    SPELLS.HOLY_WORD_SERENITY.id,
    SPELLS.LIGHTWELL.id,
  ];
}

export default AlwaysBeCasting;

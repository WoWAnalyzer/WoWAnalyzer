import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.FLASH_HEAL.id,
    SPELLS.PRAYER_OF_MENDING_CAST.id,
    TALENTS.PRAYER_OF_HEALING_TALENT.id,
    TALENTS.HOLY_WORD_SERENITY_TALENT.id,
    TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
    TALENTS.HALO_HOLY_TALENT.id,
    TALENTS.APOTHEOSIS_TALENT.id,
    TALENTS.DIVINE_HYMN_TALENT.id,
  ];
}

export default AlwaysBeCasting;

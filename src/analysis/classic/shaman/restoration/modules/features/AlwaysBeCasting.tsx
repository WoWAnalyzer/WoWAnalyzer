import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.RIP_TIDE.id,
    SPELLS.CHAIN_HEAL.id,
    SPELLS.HEALING_WAVE.id,
    SPELLS.HEALING_STREAM_TOTEM.id,
    SPELLS.MANA_SPRING_TOTEM.id,
    SPELLS.PURGE.id,
    SPELLS.STONESKIN_TOTEM.id,
    SPELLS.WATER_SHIELD.id,
  ];
}

export default AlwaysBeCasting;

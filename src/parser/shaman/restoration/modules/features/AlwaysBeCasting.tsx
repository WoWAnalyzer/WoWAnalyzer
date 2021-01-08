import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [
    SPELLS.HEALING_WAVE.id,
    SPELLS.CHAIN_HEAL.id,
    SPELLS.HEALING_SURGE.id,
    SPELLS.RIPTIDE.id,
    SPELLS.HEALING_RAIN_CAST.id,
    SPELLS.HEALING_STREAM_TOTEM_CAST.id,
    SPELLS.HEALING_TIDE_TOTEM_CAST.id,
    SPELLS.SPIRIT_LINK_TOTEM.id,
    SPELLS.WELLSPRING_TALENT.id,
    SPELLS.CLOUDBURST_TOTEM_TALENT.id,
    SPELLS.EARTHEN_WALL_TOTEM_TALENT.id,
    SPELLS.UNLEASH_LIFE_TALENT.id,
    SPELLS.EARTH_SHIELD_HEAL.id,
    SPELLS.DOWNPOUR_TALENT.id,
    SPELLS.MANA_TIDE_TOTEM_CAST.id,
    SPELLS.SURGE_OF_EARTH_TALENT.id,
    SPELLS.PRIMORDIAL_WAVE_CAST.id,
    SPELLS.CHAIN_HARVEST.id, // TODO add other covenant abilities
  ];
}

export default AlwaysBeCasting;

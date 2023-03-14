import SPELLS from 'common/SPELLS/dragonflight/phials';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

// TODO: Determine how we can tell if a phial was R1 or R2
const MIN_FLASK_IDS: number[] = [
  SPELLS.AERATED_PHIAL_OF_QUICK_HANDS.id,
  SPELLS.AERATED_PHIAL_OF_DEFTNESS.id,
  SPELLS.CRYSTALLINE_PHIAL_OF_PERCEPTION.id,
  SPELLS.STEAMING_PHIAL_OF_FINESSE.id,
];

const MAX_FLASK_IDS: number[] = [
  SPELLS.CHARGED_PHIAL_OF_ALACRITY.id,
  SPELLS.PHIAL_OF_CHARGED_ISOLATION.id,
  SPELLS.PHIAL_OF_STATIC_EMPOWERMENT.id,
  SPELLS.PHIAL_OF_STILL_AIR.id,
  SPELLS.PHIAL_OF_THE_EYE_IN_THE_STORM.id,
  SPELLS.PHIAL_OF_TEPID_VERSATILITY.id,
  SPELLS.PHIAL_OF_GLACIAL_FURY.id,
  SPELLS.ICED_PHIAL_OF_CORRUPTING_RAGE.id,
  SPELLS.PHIAL_OF_ICY_PRESERVATION.id,
  SPELLS.PHIAL_OF_ELEMENTAL_CHAOS.id,
];

class FlaskChecker extends BaseFlaskChecker {
  get MinFlaskIds(): number[] {
    return MIN_FLASK_IDS;
  }

  get MaxFlaskIds(): number[] {
    return MAX_FLASK_IDS;
  }
}

export default FlaskChecker;

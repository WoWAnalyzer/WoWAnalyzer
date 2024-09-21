import SPELLS from 'common/SPELLS/thewarwithin/flasks';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

// There isn't any way to tell the quality of the food
const MIN_FLASK_IDS: number[] = [];

const MAX_FLASK_IDS: number[] = [
  SPELLS.FLASK_OF_ALCHEMICAL_CHAOS.id,
  SPELLS.FLASK_OF_SAVING_GRACES.id,
  SPELLS.FLASK_OF_TEMPERED_AGGRESSION.id,
  SPELLS.FLASK_OF_TEMPERED_SWIFTNESS.id,
  SPELLS.FLASK_OF_TEMPERED_VERSATILITY.id,
  SPELLS.FLASK_OF_TEMPERED_MASTERY.id,
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

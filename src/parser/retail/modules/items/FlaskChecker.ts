import SPELLS from 'common/SPELLS/midnight/flasks';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

// There isn't any way to tell the quality of the food
const MIN_FLASK_IDS: number[] = [];

const MAX_FLASK_IDS: number[] = [
  SPELLS.FLASK_OF_THALASSIAN_RESISTANCE.id,
  SPELLS.FLASK_OF_THE_MAGISTERS.id,
  SPELLS.FLASK_OF_THE_BLOOD_KNIGHTS.id,
  SPELLS.FLASK_OF_THE_SHATTERED_SUN.id,
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

import SPELLS from 'common/SPELLS';
import Snapshot from '../core/Snapshot';

const GARROTE_BASE_DURATION = 18000;

/**
 * Identify inefficient refreshes of the Garrote DoT.
 */
class GarroteSnapshot extends Snapshot {
  static spellCastId = SPELLS.GARROTE.id;
  static debuffId = SPELLS.GARROTE.id;
  static spellIcon = SPELLS.GARROTE.icon;

  get durationOfFresh() {
    return GARROTE_BASE_DURATION;
  }
}

export default GarroteSnapshot;

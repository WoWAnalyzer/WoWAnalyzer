import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export const PERFECT_WASTED_PERCENT = 0.1;
export const GOOD_WASTED_PERCENT = 0.2;
export const OK_WASTED_PERCENT = 0.3;

class MaelstromWeaponTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  isDead: boolean = false;
  expiredWaste = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.MAELSTROM_WEAPON;
    this.refundOnMiss = false;
    this.refundOnMissAmount = 0;
    this.isRegenHasted = false;
    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT)
      ? 10
      : 5;
  }

  get wasted() {
    return super.wasted + this.expiredWaste;
  }

  get rawGain() {
    return this.wasted + this.generated;
  }

  get wastedPercent() {
    return this.wasted / this.rawGain;
  }

  get percentWastedPerformance(): QualitativePerformance {
    const percentWasted = this.wastedPercent;
    if (percentWasted <= PERFECT_WASTED_PERCENT) {
      return QualitativePerformance.Perfect;
    }
    if (percentWasted <= GOOD_WASTED_PERCENT) {
      return QualitativePerformance.Good;
    }
    if (percentWasted <= OK_WASTED_PERCENT) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default MaelstromWeaponTracker;

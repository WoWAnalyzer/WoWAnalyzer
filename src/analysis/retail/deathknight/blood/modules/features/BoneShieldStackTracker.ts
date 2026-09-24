import SPELLS from 'common/SPELLS';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

class BoneShieldStackTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.BONE_SHIELD;
}

export default BoneShieldStackTracker;

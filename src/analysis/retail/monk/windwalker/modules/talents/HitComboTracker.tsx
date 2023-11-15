import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class HitComboTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.HIT_COMBO_BUFF;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
}

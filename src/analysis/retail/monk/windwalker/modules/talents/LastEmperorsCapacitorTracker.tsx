import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class LastEmperorsCapacitorTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.LAST_EMPERORS_CAPACITOR_BUFF;

  constructor(options: Options) {
    super(options);
  }
}

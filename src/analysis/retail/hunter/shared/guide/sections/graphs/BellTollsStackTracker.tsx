import SPELLS from 'common/SPELLS/hunter';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class BellTollsStackTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.BELL_TOLLS_BUFF;
  static workaroundWeirdBuffEvents_experimental = true;

  constructor(options: Options) {
    super(options);
    this.buffDuration = 12_000;
  }
}

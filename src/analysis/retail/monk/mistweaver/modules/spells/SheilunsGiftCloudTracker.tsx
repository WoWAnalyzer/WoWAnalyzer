import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class SheilunsGiftCloudTracker extends BuffStackTracker {
  static trackPets = false;
  static trackedBuff = SPELLS.SHEILUN_CLOUD_BUFF;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
}

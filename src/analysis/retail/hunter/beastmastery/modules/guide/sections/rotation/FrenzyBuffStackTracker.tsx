import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class FrenzyBuffStackTracker extends BuffStackTracker {
  static trackPets = true;
  static trackedBuff = SPELLS.BARBED_SHOT_PET_BUFF;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
}

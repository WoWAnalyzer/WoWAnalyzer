import {
  ORIGINAL_FRENZY_DURATION,
  SAVAGERY_FRENZY_DURATION,
} from 'analysis/retail/hunter/beastmastery/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

export default class FrenzyBuffStackTracker extends BuffStackTracker {
  static trackPets = true;
  static trackedBuff = SPELLS.BARBED_SHOT_PET_BUFF;
  static workaroundWeirdBuffEvents_experimental = true;

  constructor(options: Options) {
    super(options);
    this.buffDuration = ORIGINAL_FRENZY_DURATION;
  }
}

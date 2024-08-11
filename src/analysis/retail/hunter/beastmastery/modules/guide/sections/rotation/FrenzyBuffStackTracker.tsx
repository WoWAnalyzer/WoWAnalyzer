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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
    this.buffDuration = this.selectedCombatant.hasTalent(TALENTS_HUNTER.SAVAGERY_TALENT)
      ? SAVAGERY_FRENZY_DURATION
      : ORIGINAL_FRENZY_DURATION;
  }
}

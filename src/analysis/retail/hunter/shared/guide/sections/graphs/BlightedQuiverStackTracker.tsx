import SPELLS from 'common/SPELLS/hunter';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

// Blighted Quiver is the TWW T3 4P Set bonus for Dark Ranger
// When casting Black Arrow, there is a 50% chance to add an additional
// arrow to the Black Arrow Volley during Withering Fire.
export default class BlightedQuiverStackTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.BLIGHTED_QUIVER_BUFF;
  static workaroundWeirdBuffEvents_experimental = true;

  constructor(options: Options) {
    super(options);
  }
}

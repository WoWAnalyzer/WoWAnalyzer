import SPELLS from 'common/SPELLS';
import BuffRefreshNormalizer from 'parser/core/BuffRefreshNormalizer';
import { Options } from 'parser/core/Module';

/**
 * Whenever an ability that grants Enrage is used, the Enrage buff is first removed
 * and then applied again. This normalizer merges the two events into a "RefreshBuff" event.
 * This cleans up the event stream and makes it easier to analyze.
 */
class EnrageRefreshNormalizer extends BuffRefreshNormalizer {
  constructor(options: Options) {
    super(options, SPELLS.ENRAGE.id, 50);
  }
}

export default EnrageRefreshNormalizer;

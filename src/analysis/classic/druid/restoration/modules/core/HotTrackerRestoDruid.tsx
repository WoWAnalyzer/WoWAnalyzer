import SPELLS from 'common/SPELLS/classic';
import HotTracker, { HotInfo } from 'parser/shared/modules/HotTracker';

class HotTrackerRestoDruid extends HotTracker {
  static dependencies = {
    ...HotTracker.dependencies,
  };

  _generateHotInfo(): HotInfo[] {
    const rejuvDuration = 15000;

    return [
      {
        spell: SPELLS.REJUVENATION,
        duration: rejuvDuration,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.REGROWTH,
        duration: 21000,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.WILD_GROWTH,
        duration: 7000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.LIFEBLOOM,
        duration: 7000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.TRANQUILITY,
        duration: 8000,
        tickPeriod: 2000,
      },
    ];
  }
}

export default HotTrackerRestoDruid;

import SPELLS from 'common/SPELLS';
import HotTracker, { HotInfo } from 'parser/shared/modules/HotTracker';

class HotTrackerRestoDruid extends HotTracker {
  _generateHotInfo(): HotInfo[] {
    return [
      {
        spell: SPELLS.REJUVENATION,
        duration: 15000,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.REJUVENATION_GERMINATION,
        duration: 15000,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.REGROWTH,
        duration: 12000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.WILD_GROWTH,
        duration: 7000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.LIFEBLOOM_DTL_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.CENARION_WARD_HEAL,
        duration: 8000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.CULTIVATION,
        duration: 6000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.SPRING_BLOSSOMS,
        duration: 6000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.TRANQUILITY_HEAL,
        duration: 8000,
        tickPeriod: 2000,
      },
    ];
  }
}

export default HotTrackerRestoDruid;

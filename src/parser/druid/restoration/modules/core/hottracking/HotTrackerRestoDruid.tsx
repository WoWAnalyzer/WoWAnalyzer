import SPELLS from 'common/SPELLS';
import HotTracker from 'parser/shared/modules/HotTracker';

class HotTrackerRestoDruid extends HotTracker {

  _generateHotInfo() { // must be generated dynamically because it reads from traits
    return {
      [SPELLS.REJUVENATION.id]: {
        duration: 15000,
        tickPeriod: 3000,
      },
      [SPELLS.REJUVENATION_GERMINATION.id]: {
        duration: 15000,
        tickPeriod: 3000,
      },
      [SPELLS.REGROWTH.id]: {
        duration: 12000,
        tickPeriod: 2000,
      },
      [SPELLS.WILD_GROWTH.id]: {
        duration: 7000,
        tickPeriod: 1000,
      },
      [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
        duration: 15000,
        tickPeriod: 1000,
      },
      [SPELLS.CENARION_WARD_HEAL.id]: {
        duration: 8000,
        tickPeriod: 2000,
      },
      [SPELLS.CULTIVATION.id]: {
        duration: 6000,
        tickPeriod: 2000,
      },
      [SPELLS.SPRING_BLOSSOMS.id]: {
        duration: 6000,
        tickPeriod: 2000,
      },
      [SPELLS.TRANQUILITY_HEAL.id]: {
        duration: 8000,
        tickPeriod: 2000,
      },
    };
  }

  _generateHotList() {
    return [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION, SPELLS.REGROWTH, SPELLS.WILD_GROWTH, SPELLS.LIFEBLOOM_HOT_HEAL, SPELLS.CENARION_WARD_HEAL, SPELLS.CULTIVATION, SPELLS.SPRING_BLOSSOMS, SPELLS.TRANQUILITY_HEAL];
  }
}

export default HotTrackerRestoDruid;

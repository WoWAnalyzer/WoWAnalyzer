import Analyzer from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class MSValues extends Analyzer {
  maxMS = 100;
  maelstromUpdates = [];


  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.MAELSTROM.id)
        .forEach(({ amount, cost, max, waste }) => {
          const msValue = amount;
          const msCost = cost || 0;
          const currentMS = msValue - msCost;
          const msWaste = waste;

          this.maelstromUpdates.push({
            timestamp: event.timestamp,
            current: currentMS,
            waste: msWaste,
            max: max,
            used: msCost,
          });
          // The variable 'max' is constant but can differentiate by racial/items.
          this.maxMS = max;
        });
    }
  }
}

export default MSValues;

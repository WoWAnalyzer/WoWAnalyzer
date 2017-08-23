import Module from 'Parser/Core/Module';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class ManaValue extends Module {
  lowestMana = null; // start at `null` and fill it with the first value to account for users starting at a non-default amount for whatever reason
  endingMana = 0;

  manaUpdates = [];

  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.MANA) {
          const manaValue = classResource.amount;
          const manaEvent = classResource.cost || 0;
          const currMana = manaValue - manaEvent;
          this.endingMana = currMana;

          if (this.lowestMana === null || currMana < this.lowestMana) {
            this.lowestMana = currMana;
          }
          this.manaUpdates.push([event.timestamp, currMana / classResource.max]);
        }
      });
    }
  }
}

export default ManaValue;

import Module from 'Parser/Core/Module';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class FocusValues extends Module {
  endingMana = 0;

  manaUpdates = [];

  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources.forEach((classResource) => {
        if (classResource.type === RESOURCE_TYPES.FOCUS) {
          const focusValue = classResource.amount;
          const manaCost = classResource.cost || 0;
          const currentMana = manaValue - manaCost;
          this.endingMana = currentMana;

          if (this.lowestMana === null || currentMana < this.lowestMana) {
            this.lowestMana = currentMana;
          }
          this.manaUpdates.push({
            timestamp: event.timestamp,
            current: currentMana,
            max: classResource.max,
            used: manaCost,
          });
        }
      });
    }
  }
}

export default ManaValues;

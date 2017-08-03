import Module from 'Parser/Core/Module';

const debug = false;

const MANA_CLASS_RESOURCE_ID = 0;

class ManaValue extends Module {
  lowestMana = 1100000;
  endingMana = 0;

  on_byPlayer_cast(event) {
    // class resource type 0 means the resource is mana
    event.classResources.forEach(classResource => {
      if (classResource.type === MANA_CLASS_RESOURCE_ID) {
        const manaValue = classResource.amount;
        const manaEvent = classResource.cost || 0;
        const currMana = manaValue - manaEvent;
        this.endingMana = currMana;

        if(this.lowestMana > currMana) {
          this.lowestMana = currMana;
        }
      }
    });
  }

  on_finished() {
    if(debug) {
      console.log('Ending Mana: ', this.endingMana);
      console.log('Lowest Mana: ', this.lowestMana);
    }
  }

}

export default ManaValue;

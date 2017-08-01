import Module from 'Parser/Core/Module';

const debug = false;

const MANA_CLASS_RESOURCE_ID = 0;

class ManaValue extends Module {
  lowestMana = 1100000;
  endingMana = 0;

  on_byPlayer_cast(event) {
    // class resource type 0 means the resource is mana
    if (event.classResources && event.classResources[0] && event.classResources[0].type === MANA_CLASS_RESOURCE_ID) {
      const manaValue = event.classResources[0].amount;
      this.endingMana = manaValue;

      if(this.lowestMana > manaValue) {
        this.lowestMana = manaValue;
      }
    }
  }

  on_finished() {
    if(debug) {
      console.log('Ending Mana: ', this.endingMana);
      console.log('Lowest Mana: ', this.lowestMana);
    }
  }

}

export default ManaValue;

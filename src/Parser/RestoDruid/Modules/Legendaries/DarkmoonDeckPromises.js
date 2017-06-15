import DarkmoonDeckPromisesCore from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';


class DarkmoonDeckPromises extends DarkmoonDeckPromisesCore {
  // The actual savings
  savings = 0;

  on_initialized() {
    super.on_initialized();
  }

  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

    const resource = event.classResources[0];
    const newSavings = this.manaGained;
    const manaLeftAfterCast = resource.amount - resource.cost;
    const savingsUsed = newSavings - manaLeftAfterCast;

    if(savingsUsed > 0) {
      this.manaGained = newSavings - savingsUsed;
      this.savings = this.savings + savingsUsed;
    } else {
      this.manaGained = newSavings;
    }
  }
}

export default DarkmoonDeckPromises;

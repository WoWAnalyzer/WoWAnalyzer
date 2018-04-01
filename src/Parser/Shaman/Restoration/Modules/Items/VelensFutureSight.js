import CoreVelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';

class VelensFutureSight extends CoreVelensFutureSight {
  on_heal(event) {
    if (this.owner.byPlayerPet(event)) {
      this.registerHeal(event);
    }
  }
  on_absorbed(event) {
    if (this.owner.byPlayerPet(event)) {
      this.registerHeal(event);
    }
  }
}

export default VelensFutureSight;

import Requirement from '../Requirement';

class EnchantsRequirement extends Requirement {
  constructor(options = {}) {
    super({
      name: 'Gear has best enchants',
      check: function () { // don't use arrow function or `this` won't be set properly
        const numEnchantableSlots = Object.keys(this.enchantChecker.enchantableGear).length;
        return {
          actual: numEnchantableSlots - (this.enchantChecker.slotsMissingEnchant.length + this.enchantChecker.slotsMissingMaxEnchant.length),
          max: numEnchantableSlots,
          isLessThan: numEnchantableSlots,
          style: 'number',
        };
      },
      ...options,
    });
  }
}

export default EnchantsRequirement;

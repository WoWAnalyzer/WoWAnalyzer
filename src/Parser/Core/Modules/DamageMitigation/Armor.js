import Analyzer from 'Parser/Core/Analyzer';

class Armor extends Analyzer {

  armor = 0;

  constructor(...args) {
    super(...args);
    this.armor = this.selectedCombatant._combatantInfo.armor;
  }

  get currentArmorPercentage() {
    // tfw you get a formula from a rando on the wow forums
    return this.armor / (this.armor + 1423); // K value is 6300 for lv 120, 1423 for lv 110.
  }

  on_toPlayer_damage(event) {
    if (event.armor) {
      this.armor = event.armor;
    }
  }
}

export default Armor;

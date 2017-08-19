import Module from 'Parser/Core/Module';
import { getMagicDescription } from 'common/DamageTypes.js';

const debug = false;

class DamageValue {
  Amount = 0;
  Absorb = 0;
  Overkill = 0;

  get Total() {
    return this.Amount + this.Absorb + this.Overkill;
  }

  AddDamage(event) {
    this.Amount += event.amount || 0;
    this.Absorb += event.absorbed || 0;
    this.Overkill += event.overkill || 0;
  }
}

class DamageTaken extends Module {
  DamageBySchool = {};
  DamageByAbility = {};
  TotalDamage = new DamageValue();

  on_toPlayer_damage(event) {
    const type = getMagicDescription(event.ability.type);
    if (this.DamageBySchool[type] === undefined) {
      this.DamageBySchool[type] = new DamageValue();
    }
    if (this.DamageByAbility[event.ability.name] === undefined) {
      this.DamageByAbility[event.ability.name] = new DamageValue();
    }
    this.DamageBySchool[type].AddDamage(event);
    this.DamageByAbility[event.ability.name].AddDamage(event);
    this.TotalDamage.AddDamage(event);
  }

  on_finished() {
    debug && console.log(this);
  }
}

export default DamageTaken;

import Module from 'Parser/Core/Module';
import { getMagicDescription } from 'common/DamageTypes.js';
import SPELLS from 'common/SPELLS';

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
  ShamanTotem = new DamageValue();

  on_toPlayer_damage(event) {
    // In the logs this is not counted as damage but negative healing, seperating it out here in case someone wants to access this.
    // TODO: I think there is a paladin mechanic that appears the same, though i am unsure if it affects the damage taken.
    if (event.ability.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      this.ShamanTotem.AddDamage(event);
      return;
    }
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

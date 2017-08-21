import Module from 'Parser/Core/Module';
import { getMagicDescription } from 'common/DamageTypes.js';
import SPELLS from 'common/SPELLS';

const debug = false;

export class DamageValue {
  amount = 0;
  absorb = 0;
  overkill = 0;

  get total() {
    return this.amount + this.absorb + this.overkill;
  }

  addDamage(event) {
    this.amount += event.amount || 0;
    this.absorb += event.absorbed || 0;
    this.overkill += event.overkill || 0;
  }

  reduceDamage(event) {
    this.amount -= event.amount || 0;
    this.absorb -= event.absorbed || 0;
    this.overkill -= event.overkill || 0;
  }
}

class DamageTaken extends Module {
  damageBySchool = {};
  damageByAbility = {};
  totalDamage = new DamageValue();
  shamanTotem = new DamageValue();

  on_toPlayer_damage(event) {
    // In the logs this is not counted as damage but negative healing, seperating it out here in case someone wants to access this.
    if (event.ability.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      this.shamanTotem.addDamage(event);
      return;
    }
    const type = getMagicDescription(event.ability.type);
    if (this.damageBySchool[type] === undefined) {
      this.damageBySchool[type] = new DamageValue();
    }
    if (this.damageByAbility[event.ability.name] === undefined) {
      this.damageByAbility[event.ability.name] = new DamageValue();
    }
    this.damageBySchool[type].addDamage(event);
    this.damageByAbility[event.ability.name].addDamage(event);
    this.totalDamage.addDamage(event);
  }

  on_finished() {
    debug && console.log(this);
  }
}

export default DamageTaken;

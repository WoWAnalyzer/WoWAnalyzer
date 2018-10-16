import Analyzer from 'parser/core/Analyzer';

class CritEffectBonus extends Analyzer {
  static BASE_CRIT_EFFECT_MOD = 2;

  _hooks = [];
  hook(func) {
    this._hooks.push(func);
  }

  getBonus(event) {
    return this._hooks.reduce((critEffectModifier, hook) => hook(critEffectModifier, event), this.constructor.BASE_CRIT_EFFECT_MOD);
  }
}

export default CritEffectBonus;

import Analyzer from 'parser/core/Analyzer';
import { AbsorbedEvent, DamageEvent, HealEvent } from 'parser/core/Events';

import { HealerStatWeightEvents } from '../features/BaseHealerStatValues';

class CritEffectBonus extends Analyzer {
  static BASE_CRIT_EFFECT_MOD = 2;

  _hooks: Array<(critEffectModifier: number, event: ValidEvents) => number> = [];
  hook(func: (critEffectModifier: number, event: ValidEvents) => number) {
    this._hooks.push(func);
  }

  getBonus(event: ValidEvents) {
    return this._hooks.reduce(
      (
        critEffectModifier: number,
        hook: (critEffectModifier: number, event: ValidEvents) => number,
      ) => hook(critEffectModifier, event),
      CritEffectBonus.BASE_CRIT_EFFECT_MOD,
    );
  }
}

export default CritEffectBonus;

export type ValidEvents = HealEvent | DamageEvent | AbsorbedEvent | HealerStatWeightEvents;

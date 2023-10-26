import Analyzer from 'parser/core/Analyzer';
import { AbsorbedEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';

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

  private rawContribution(event: DamageEvent | HealEvent, critEffect: number): number {
    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.type === EventType.Heal ? event.overheal || 0 : 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.getBonus(event);

    return rawNormalPart * critEffect;
  }

  getDamageContribution(
    event: DamageEvent,
    critEffect: number,
    affectsTotalDamage = false,
  ): number {
    const effectiveCritEffect = affectsTotalDamage ? critEffect * 2 : critEffect;
    return this.rawContribution(event, effectiveCritEffect);
  }

  getHealingContribution(
    event: HealEvent,
    critEffect: number,
    affectsTotalDamage = false,
  ): { effectiveHealing: number; overhealing: number } {
    const effectiveCritEffect = affectsTotalDamage ? critEffect * 2 : critEffect;
    const overheal = event.overheal || 0;
    const rawContribution = this.rawContribution(event, effectiveCritEffect);
    const effectiveHealing = Math.max(0, rawContribution - overheal);

    return {
      effectiveHealing,
      overhealing: rawContribution - effectiveHealing,
    };
  }
}

export default CritEffectBonus;

export type ValidEvents = HealEvent | DamageEvent | AbsorbedEvent | HealerStatWeightEvents;

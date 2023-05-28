import Spell from 'common/SPELLS/Spell';
import { AnyEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import { ReactNode } from 'react';

export type FilteredDamageObserver = (event: CastEvent) => void;

class FilteredDamageTracker extends DamageTracker {
  castObservers: FilteredDamageObserver[] = [];

  onDamage(event: DamageEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    super.onDamage(event);
  }

  onHeal(event: HealEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    super.onHeal(event);
  }

  onCast(event: CastEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    this.broadcastCastEvent(event);
    super.onCast(event);
  }

  shouldProcessEvent(event: AnyEvent) {
    return false;
  }

  subscribeToCastEvent(fn: FilteredDamageObserver) {
    this.castObservers.push(fn);
  }

  subscribeInefficientCast(spells: Spell[], messageFunction: (spell: Spell) => ReactNode) {
    this.subscribeToCastEvent((event) => {
      const spell = spells.find((s) => event.ability.guid === s.id);
      if (spell) {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = messageFunction(spell);
      }
    });
  }

  broadcastCastEvent(event: CastEvent) {
    this.castObservers.forEach((subscriber) => subscriber(event));
  }
}

export default FilteredDamageTracker;

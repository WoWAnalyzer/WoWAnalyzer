import Spell from 'common/SPELLS/Spell';
import { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

class FilteredDamageTracker extends DamageTracker {
  castObservers: any[] = [];

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

  shouldProcessEvent(event: any) {
    return false;
  }

  subscribeToCastEvent(fn: any) {
    this.castObservers.push(fn);
  }

  subscribeInefficientCast(spells: Spell[], messageFunction: any) {
    this.subscribeToCastEvent((event: any) => {
      const spell = spells.find(s => event.ability.guid === s.id);
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

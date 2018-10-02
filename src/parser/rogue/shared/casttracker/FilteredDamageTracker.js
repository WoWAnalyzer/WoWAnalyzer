import DamageTracker from 'parser/core/modules/AbilityTracker';

class FilteredDamageTracker extends DamageTracker {
  
  constructor(...args) {
    super(...args);
    this.castObservers = [];
  }
  
  on_byPlayer_damage(event) {
    if(!this.shouldProcessEvent(event)) return;
    super.on_byPlayer_damage(event);
  }

  on_byPlayer_heal(event) {
    if(!this.shouldProcessEvent(event)) return;
    super.on_byPlayer_heal(event);
  }

  on_byPlayer_cast(event) {
    if(!this.shouldProcessEvent(event)) return;
    this.broadcastCastEvent(event);
    super.on_byPlayer_cast(event);
  }
    
  shouldProcessEvent(event) {
    return false;
  }

  subscribeToCastEvent(fn) {
    this.castObservers.push(fn);
  }

  subscribeInefficientCast(spells, messageFunction) {
    this.subscribeToCastEvent((event) => {
      const spell = spells.find(s=>event.ability.guid === s.id);
      if(spell) {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = messageFunction(spell);
      }      
    });
  }

  broadcastCastEvent(event) {
    this.castObservers.forEach((subscriber) => subscriber(event));
  }
}

export default FilteredDamageTracker;

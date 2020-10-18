import DamageTracker from 'parser/shared/modules/AbilityTracker';

class FilteredDamageTracker extends DamageTracker {
  
  constructor(...args) {
    super(...args);
    this.castObservers = [];
  }
  
  onDamage(event) {
    if(!this.shouldProcessEvent(event)) {return;}
    super.onDamage(event);
  }

  onHeal(event) {
    if(!this.shouldProcessEvent(event)) {return;}
    super.onHeal(event);
  }

  onCast(event) {
    if(!this.shouldProcessEvent(event)) {return;}
    this.broadcastCastEvent(event);
    super.onCast(event);
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

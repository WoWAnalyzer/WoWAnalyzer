import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

class FilteredDamageTracker extends DamageTracker {
  
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
    super.on_byPlayer_cast(event);
  }
    
  shouldProcessEvent(event) {
    return false;
  }
}

export default FilteredDamageTracker;
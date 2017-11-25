import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

class FilteredDamageTracker extends DamageTracker {
  
  on_byPlayer_damage(event) {
    if(!this.shouldProcessCastEvent(event)) return;
    super.on_byPlayer_damage(event);
  }

  on_byPlayer_heal(event) {
    if(!this.shouldProcessCastEvent(event)) return;
    super.on_byPlayer_heal(event);
  }

  on_byPlayer_cast(event) {
    if(!this.shouldProcessCastEvent(event)) return;
    super.on_byPlayer_cast(event);
  }
    
  shouldProcessCastEvent(event) {
    return false;
  }
}

export default FilteredDamageTracker;
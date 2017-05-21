import AbilityTracker from 'Main/Parser/Modules/Core/AbilityTracker';

class DruidAbilityTracker extends AbilityTracker {
  on_byPlayer_heal(event) {
    if (super.on_byPlayer_heal) {
      super.on_byPlayer_heal(event);
    }
  }
}

export default DruidAbilityTracker;

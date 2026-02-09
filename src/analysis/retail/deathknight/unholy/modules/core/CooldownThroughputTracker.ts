import CoreCooldownThroughputTracker from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [...CoreCooldownThroughputTracker.cooldownSpells];
}

export default CooldownThroughputTracker;

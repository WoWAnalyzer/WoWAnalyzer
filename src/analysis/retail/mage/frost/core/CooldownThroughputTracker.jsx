import CoreCooldownThroughputTracker from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [...CoreCooldownThroughputTracker.cooldownSpells];

  static castCooldowns = [...CoreCooldownThroughputTracker.castCooldowns];
}

export default CooldownThroughputTracker;

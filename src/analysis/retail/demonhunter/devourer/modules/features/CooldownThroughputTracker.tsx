import CoreCooldownThroughputTracker from 'parser/shared/modules/CooldownThroughputTracker';

export class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [...CoreCooldownThroughputTracker.cooldownSpells];
}

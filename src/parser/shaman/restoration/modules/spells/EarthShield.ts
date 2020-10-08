import SPELLS from 'common/SPELLS';
import EarthShieldCore from '../../../shared/talents/EarthShield';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class EarthShield extends EarthShieldCore {
  static dependencies = {
    ...EarthShieldCore.dependencies,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  getFeeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);;
  }
}

export default EarthShield;
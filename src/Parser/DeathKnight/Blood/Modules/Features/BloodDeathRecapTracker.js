import DeathRecapTracker from 'Main/DeathRecapTracker';
import SPELLS from 'common/SPELLS';

class BloodDeathRecapTracker extends DeathRecapTracker {

  on_initialized() {
    this.defensiveBuffs = [
      SPELLS.BONE_SHIELD.id,
      SPELLS.DANCING_RUNE_WEAPON.id,
    ];
  }
}

export default BloodDeathRecapTracker;
import Analyzer, { Options } from 'parser/core/Analyzer';
import { MaelstromWeaponSpenders, MaelstromWeaponTracker } from '../resourcetracker';
import { TALENTS_SHAMAN } from '../../../../../../common/TALENTS';

class StaticAccumulation extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
    MaelstromWeaponSpenders: MaelstromWeaponSpenders,
  };

  protected maelstromWeaponTracker!: MaelstromWeaponTracker;
  protected MaelstromWeaponSpenders!: MaelstromWeaponSpenders;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.STATIC_ACCUMULATION_TALENT);
    if (!this.active) {
      return;
    }
  }
}

export default StaticAccumulation;

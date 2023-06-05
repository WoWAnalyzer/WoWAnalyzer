import Analyzer from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import TALENTS from 'common/TALENTS/shaman';

class MaelstromWeaponDetails extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  maelstromWeaponTracker!: MaelstromWeaponTracker;

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE()}
        tooltip={`${formatPercentage(this.maelstromWeaponTracker.wastedPercent)}% wasted`}
      >
        <BoringSpellValueText spell={TALENTS.MAELSTROM_WEAPON_TALENT}>
          {formatNumber(this.maelstromWeaponTracker.wasted)} <small>stacks wasted</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MaelstromWeaponDetails;

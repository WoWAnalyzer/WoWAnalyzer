import Analyzer from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import TALENTS from 'common/TALENTS/shaman';

export default class extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  maelstromWeaponTracker!: MaelstromWeaponTracker;

  statistic() {
    const gainedPerSecond = this.maelstromWeaponTracker.rawGain / (this.owner.fightDuration / 1000);
    const spentPerSecond = this.maelstromWeaponTracker.spent / (this.owner.fightDuration / 1000);
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE()}
        tooltip={
          <>
            {this.maelstromWeaponTracker.generated} stacks gained
            <br />
            {this.maelstromWeaponTracker.wasted} stacks wasted
            <br />
            {spentPerSecond.toFixed(2)} spent per second
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.MAELSTROM_WEAPON_TALENT}>
          {gainedPerSecond.toFixed(2)} <small>stacks per second</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

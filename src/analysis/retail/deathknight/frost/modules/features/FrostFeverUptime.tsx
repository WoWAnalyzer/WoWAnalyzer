import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get frostFeverUptime() {
    return this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(20)} size="flexible">
        <BoringSpellValueText spell={SPELLS.FROST_FEVER}>
          <>
            <UptimeIcon /> {formatPercentage(this.frostFeverUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FrostFeverUptime;

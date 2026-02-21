import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class PlagueEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get virulentPlagueUptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
  }

  get dreadPlagueUptime() {
    return this.enemies.getBuffUptime(SPELLS.DREAD_PLAGUE.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <BoringSpellValueText spell={SPELLS.VIRULENT_PLAGUE.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.virulentPlagueUptime)}%{' '}
            <small>Disease Uptime</small>
          </>
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DREAD_PLAGUE.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.dreadPlagueUptime)}% <small>Disease Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueEfficiency;

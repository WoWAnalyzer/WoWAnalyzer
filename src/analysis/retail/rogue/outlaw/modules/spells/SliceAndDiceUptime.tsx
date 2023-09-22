import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class SliceAndDiceUptime extends Analyzer {
  get percentUptime(): number {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SLICE_AND_DICE.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(100)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.SLICE_AND_DICE} /> Uptime
          </label>
          <div className="value">{formatPercentage(this.percentUptime)}%</div>
        </div>
      </Statistic>
    );
  }
}

export default SliceAndDiceUptime;

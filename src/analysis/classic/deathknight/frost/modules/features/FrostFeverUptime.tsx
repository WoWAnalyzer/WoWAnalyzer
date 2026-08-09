import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(10)} size="flexible">
        <BoringSpellValueText spell={SPELLS.FROST_FEVER}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FrostFeverUptime;

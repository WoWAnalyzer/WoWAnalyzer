import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { formatDuration, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import SPELLS from 'common/SPELLS/demonhunter';

export default class Blur extends Analyzer {
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLUR_BUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.6,
        average: 0.55,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={<>Total uptime was {formatDuration(this.uptime)}.</>}
      >
        <BoringSpellValueText spell={SPELLS.BLUR}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BloodPlagueUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BLOOD_PLAGUE.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
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
      <Statistic size="small" position={STATISTIC_ORDER.CORE(2)}>
        <BoringSpellValueText spell={SPELLS.BLOOD_PLAGUE}>
          <Trans id="deathknight.blood.bloodPlague.statistic">
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BloodPlagueUptime;

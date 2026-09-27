import { Trans } from '@lingui/react/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MINOR_UPTIME_THRESHOLD = 0.6;
const AVERAGE_UPTIME_THRESHOLD = 0.5;
const MAJOR_UPTIME_THRESHOLD = 0.4;

class DeathAndDecayUptime extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DEATH_AND_DECAY_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: MINOR_UPTIME_THRESHOLD,
        average: AVERAGE_UPTIME_THRESHOLD,
        major: MAJOR_UPTIME_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        size="small"
        position={STATISTIC_ORDER.CORE(4)}
        tooltip={
          <Trans id="deathknight.blood.deathAndDecay.statistic.tooltip">
            Aim for at least {formatPercentage(MINOR_UPTIME_THRESHOLD, 0)}% uptime.
          </Trans>
        }
      >
        <BoringSpellValueText spell={SPELLS.DEATH_AND_DECAY_BUFF}>
          <Trans id="deathknight.blood.deathAndDecay.statistic">
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndDecayUptime;

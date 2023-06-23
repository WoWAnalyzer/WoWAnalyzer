import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
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

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.blood.bloodPlague.suggestion.suggestion">
          Your <SpellLink spell={SPELLS.BLOOD_PLAGUE} /> uptime can be improved. Keeping{' '}
          <SpellLink spell={TALENTS.BLOOD_BOIL_TALENT} /> on cooldown should keep it up at all
          times.
        </Trans>,
      )
        .icon(SPELLS.BLOOD_PLAGUE.icon)
        .actual(
          t({
            id: 'deathknight.blood.bloodPlague.suggestion.actual',
            message: `${formatPercentage(actual)}% Blood Plague uptime`,
          }),
        )
        .recommended(
          t({
            id: 'shared.suggestion.recommended.moreThanPercent',
            message: `>${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
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

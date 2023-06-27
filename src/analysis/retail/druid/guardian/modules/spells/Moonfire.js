import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Moonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const moonfireUptimePercentage =
      this.enemies.getBuffUptime(SPELLS.MOONFIRE_DEBUFF.id) / this.owner.fightDuration;

    when(moonfireUptimePercentage)
      .isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            {' '}
            Your <SpellLink spell={SPELLS.MOONFIRE_DEBUFF} /> uptime was{' '}
            {formatPercentage(moonfireUptimePercentage)}%, unless you have extended periods of
            downtime it should be near 100%.
          </span>,
        )
          .icon(SPELLS.MOONFIRE_DEBUFF.icon)
          .actual(`${formatPercentage(moonfireUptimePercentage)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.15),
      );
  }

  statistic() {
    const moonfireUptimePercentage =
      this.enemies.getBuffUptime(SPELLS.MOONFIRE_DEBUFF.id) / this.owner.fightDuration;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={
          <>
            Your <strong>Moonfire</strong> uptime is{' '}
            <strong>{`${formatPercentage(moonfireUptimePercentage)}%`}</strong>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.MOONFIRE_DEBUFF} /> Moonfire uptime{' '}
            </>
          }
        >
          {`${formatPercentage(moonfireUptimePercentage)}%`}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Moonfire;

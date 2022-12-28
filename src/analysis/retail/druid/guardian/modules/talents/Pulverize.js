import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Pulverize extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT);
  }

  suggestions(when) {
    const pulverizeUptimePercentage =
      this.selectedCombatant.getBuffUptime(SPELLS.PULVERIZE_BUFF.id) / this.owner.fightDuration;

    this.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT) &&
      when(pulverizeUptimePercentage)
        .isLessThan(0.9)
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <span>
              {' '}
              Your <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> uptime was{' '}
              {formatPercentage(pulverizeUptimePercentage)}%, unless there are extended periods of
              downtime it should be over should be near 100%. <br />
              All targets deal less damage to you due to the{' '}
              <SpellLink id={SPELLS.PULVERIZE_BUFF.id} /> buff.
            </span>,
          )
            .icon(SPELLS.PULVERIZE_TALENT.icon)
            .actual(
              t({
                id: 'druid.guardian.suggestions.pulverize.uptime',
                message: `${formatPercentage(pulverizeUptimePercentage)}% uptime`,
              }),
            )
            .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
            .regular(recommended - 0.1)
            .major(recommended - 0.2),
        );
  }

  statistic() {
    const pulverizeUptimePercentage =
      this.selectedCombatant.getBuffUptime(SPELLS.PULVERIZE_BUFF.id) / this.owner.fightDuration;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValue
          spellId={SPELLS.PULVERIZE_TALENT.id}
          value={`${formatPercentage(pulverizeUptimePercentage)}%`}
          label="Pulverize uptime"
        />
      </Statistic>
    );
  }
}

export default Pulverize;

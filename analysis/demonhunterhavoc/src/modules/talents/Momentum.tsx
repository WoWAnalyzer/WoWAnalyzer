import { t } from '@lingui/macro';
import { formatDuration, formatPercentage } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
example report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV/#fight=48&source=10
* */

class Momentum extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(DH_TALENTS.MOMENTUM_TALENT.id);
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(DH_SPELLS.MOMENTUM_BUFF.id) / this.owner.fightDuration
    );
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(DH_SPELLS.MOMENTUM_BUFF.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.55,
        average: 0.45,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Maintain the <SpellLink id={DH_TALENTS.MOMENTUM_TALENT.id} /> buff to maximize damage.
        </>,
      )
        .icon(DH_TALENTS.MOMENTUM_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.havoc.suggestions.momentum.uptime',
            message: `${formatPercentage(actual)}% buff uptime`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`The Momentum buff total uptime was ${formatDuration(this.buffDuration)}.`}
      >
        <BoringSpellValueText spellId={DH_TALENTS.MOMENTUM_TALENT.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Momentum;

import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

// the buff events all use this spell
export const RUSHING_JADE_WIND_BUFF = talents.RUSHING_JADE_WIND_TALENT;

class RushingJadeWind extends Analyzer {
  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(RUSHING_JADE_WIND_BUFF.id) / this.owner.fightDuration
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RUSHING_JADE_WIND_TALENT);
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had low uptime on <SpellLink id={talents.RUSHING_JADE_WIND_TALENT.id} />. Try to
          maintain 100% uptime by refreshing the buff before it drops.
        </>,
      )
        .icon(talents.RUSHING_JADE_WIND_TALENT.icon)
        .actual(
          t({
            id: 'monk.brewmaster.suggestions.rushingJadeWind.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RushingJadeWind;

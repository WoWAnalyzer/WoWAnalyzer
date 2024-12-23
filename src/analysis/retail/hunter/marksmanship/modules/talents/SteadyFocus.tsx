import { Trans } from '@lingui/macro';
import { STEADY_FOCUS_HASTE_PERCENT } from 'analysis/retail/hunter/marksmanship/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import HasteIcon from 'interface/icons/Haste';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Using Steady Shot twice in a row increases your Haste by 8% for 15 sec.
 *
 * Example log:
 *
 */

class SteadyFocus extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.STEADY_FOCUS_TALENT);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.STEADY_FOCUS_BUFF.id) / this.owner.fightDuration
    );
  }

  get avgHaste() {
    return (
      this.uptime *
      STEADY_FOCUS_HASTE_PERCENT[
        this.selectedCombatant.getTalentRank(TALENTS_HUNTER.STREAMLINE_TALENT)
      ]
    );
  }

  get uptimeThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.6,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_HUNTER.STEADY_FOCUS_TALENT}>
          <>
            <HasteIcon /> {formatPercentage(this.avgHaste)}% <small>average Haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your uptime on the buff from <SpellLink spell={TALENTS_HUNTER.STEADY_FOCUS_TALENT} />{' '}
          could be better. When using this talent you should always try and couple your{' '}
          <SpellLink spell={SPELLS.STEADY_SHOT} /> together to maintain this buff.
        </>,
      )
        .icon(TALENTS_HUNTER.STEADY_FOCUS_TALENT.icon)
        .actual(
          <Trans id="hunter.marksmanship.suggestions.steadyFocus.uptime">
            {' '}
            {formatPercentage(actual)}% uptime{' '}
          </Trans>,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default SteadyFocus;

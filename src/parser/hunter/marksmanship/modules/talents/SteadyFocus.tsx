import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import HasteIcon from 'interface/icons/Haste';
import { formatPercentage } from 'common/format';
import { STEADY_FOCUS_HASTE_PERCENT } from 'parser/hunter/marksmanship/constants';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';

/**
 * Using Steady Shot twice in a row increases your Haste by 7% for 15 sec.
 *
 * Example log:
 *
 */

class SteadyFocus extends Analyzer {

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEADY_FOCUS_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.STEADY_FOCUS_BUFF.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * STEADY_FOCUS_HASTE_PERCENT;
  }

  get uptimeThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.80,
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
        <BoringSpellValueText spell={SPELLS.STEADY_FOCUS_TALENT}>
          <>
            <HasteIcon /> {formatPercentage(this.avgHaste)}% <small>average Haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        Your uptime on the buff from <SpellLink id={SPELLS.STEADY_FOCUS_TALENT.id} /> could be better. When using this talent you should always try and couple your <SpellLink id={SPELLS.STEADY_SHOT.id} /> together to maintain this buff.
      </>,
    )
      .icon(SPELLS.STEADY_FOCUS_TALENT.icon)
      .actual(<Trans id='hunter.marksmanship.suggestions.steadyFocus.uptime'> {formatPercentage(actual)}% uptime </Trans>)
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }
}

export default SteadyFocus;

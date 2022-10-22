import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

import { CURSE_OF_AGONY, CURSE_OF_DOOM, CURSE_OF_THE_ELEMENTS } from '../../SPELLS';

class Curses extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      (this.enemies.getBuffUptime(CURSE_OF_AGONY) +
        this.enemies.getBuffUptime(CURSE_OF_DOOM) +
        this.enemies.getBuffUptime(CURSE_OF_THE_ELEMENTS)) /
      this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          <Trans id="warlock.wotlk.suggestions.curse.description"></Trans>
        </span>,
      )
        .icon('classicon_warlock')
        .actual(
          t({
            id: 'warlock.wotlk.suggestions.curse.uptime',
            message: `${formatPercentage(actual)}`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Curses;

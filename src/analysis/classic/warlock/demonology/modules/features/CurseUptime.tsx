import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS/classic/warlock';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

class CurseUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      (this.enemies.getBuffUptime(SPELLS.CURSE_OF_AGONY.id) +
        this.enemies.getBuffUptime(SPELLS.CURSE_OF_DOOM.id) +
        this.enemies.getBuffUptime(SPELLS.CURSE_OF_THE_ELEMENTS.id)) /
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
          <Trans id="warlock.wotlk.suggestions.curse.description">
            Your curse uptime can be improved.
          </Trans>
        </span>,
      )
        .icon('classicon_warlock')
        .actual(
          t({
            id: 'warlock.wotlk.suggestions.curse.uptime',
            message: `${formatPercentage(actual)}% Curse uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default CurseUptime;

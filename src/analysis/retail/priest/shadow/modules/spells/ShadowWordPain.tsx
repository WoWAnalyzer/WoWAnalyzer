import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

/*
  Shadow word pain can be created by:

  Hard casting
  Misery
  Dark Void

  Shadow Word pain can be refreshed by:

  Hard casting
  Misery
  Dark Void
  Void Bolt
 */
class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  lastCastTimestamp = 0;
  castedShadowWordPains = 0;
  appliedShadowWordPains = 0;
  refreshedShadowWordPains = 0;
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more
          attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.
        </span>,
      )
        .icon(SPELLS.SHADOW_WORD_PAIN.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.shadowWordPain.uptime',
            message: `${formatPercentage(actual)}% Shadow Word: Pain uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SHADOW_WORD_PAIN.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SHADOW_WORD_PAIN],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default ShadowWordPain;

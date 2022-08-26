import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

/**
 * Example Report: https://www.warcraftlogs.com/reports/VFc92Gf8dv3Nyjwm#fight=25&source=13
 */

const BAR_COLOR = '#ff0d0e';

class SinfulBrandUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get suggestionThresholds() {
    const sinfulBrandUptime =
      this.enemies.getBuffUptime(SPELLS.SINFUL_BRAND.id) / this.owner.fightDuration;
    return {
      actual: sinfulBrandUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.SINFUL_BRAND.id} /> uptime can be improved. Try to pay more
          attention to your Sinful Brand on the boss, perhaps use some debuff tracker.
        </>,
      )
        .icon(SPELLS.SINFUL_BRAND.icon)
        .actual(
          t({
            id: 'demonhunter.havoc.suggestions.sinfulBrand.uptime',
            message: `${formatPercentage(actual)}% Sinful Brand uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SINFUL_BRAND.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SINFUL_BRAND],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default SinfulBrandUptime;

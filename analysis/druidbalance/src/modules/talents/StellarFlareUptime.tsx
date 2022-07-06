import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#6699ff';

class StellarFlareUptime extends Analyzer {
  get suggestionThresholds() {
    const stellarFlareUptime =
      this.enemies.getBuffUptime(SPELLS.STELLAR_FLARE_TALENT.id) / this.owner.fightDuration;
    return {
      actual: stellarFlareUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> uptime can be improved. Try to pay
          more attention to your Stellar Flare on the boss.
        </>,
      )
        .icon(SPELLS.STELLAR_FLARE_TALENT.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.stellarFlare.uptime',
            message: `${formatPercentage(actual)}% Stellar Flare uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.STELLAR_FLARE_TALENT.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.STELLAR_FLARE_TALENT],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default StellarFlareUptime;

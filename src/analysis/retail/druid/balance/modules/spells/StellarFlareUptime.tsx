import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { TALENTS_DRUID } from 'common/TALENTS';

const BAR_COLOR = '#6699ff';

class StellarFlareUptime extends Analyzer {
  get suggestionThresholds() {
    const stellarFlareUptime =
      this.enemies.getBuffUptime(TALENTS_DRUID.STELLAR_FLARE_TALENT.id) / this.owner.fightDuration;
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
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_TALENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={TALENTS_DRUID.STELLAR_FLARE_TALENT} /> uptime can be improved. Try
          to pay more attention to your Stellar Flare on the boss.
        </>,
      )
        .icon(TALENTS_DRUID.STELLAR_FLARE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Stellar Flare uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS_DRUID.STELLAR_FLARE_TALENT.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS_DRUID.STELLAR_FLARE_TALENT],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default StellarFlareUptime;

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TALENTS from 'common/TALENTS/warlock';

class FelCovenant extends Analyzer {
  static talent = TALENTS.FEL_COVENANT_TALENT;
  static buffId = SPELLS.FEL_COVENANT_BUFF.id;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(FelCovenant.talent);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(FelCovenant.buffId) / this.owner.fightDuration;
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()}>
        <BoringSpellValueText spell={FelCovenant.buffId}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={FelCovenant.buffId} /> uptime can be improved. Make sure it's
          always active. Cast <SpellLink spell={SPELLS.SHADOW_BOLT_DEMO} /> if the buff is about to
          fall off.
        </>,
      )
        .icon(SPELLS.FEL_COVENANT_BUFF.icon)
        .actual(
          <>
            <SpellLink spell={FelCovenant.buffId} /> was active for {formatPercentage(actual)}% of
            the fight
          </>,
        )
        .recommended(`recommended: ${formatPercentage(recommended)}%`),
    );
  }
}

export default FelCovenant;

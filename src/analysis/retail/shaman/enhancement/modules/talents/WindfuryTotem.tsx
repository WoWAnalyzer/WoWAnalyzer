import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';

class WindfuryTotem extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT);

    if (!this.active) {
      return;
    }
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.WINDFURY_TOTEM_BUFF.id) / this.owner.fightDuration
    );
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        // To be adjusted once we know how much dps Windfury Totem contributes
        minor: 0.99,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()} size="flexible">
        <TalentSpellText talent={TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.WINDFURY_TOTEM_BUFF} /> uptime can be improved. Make sure
          it's always active. Cast <SpellLink spell={TALENTS_SHAMAN.WINDFURY_TOTEM_TALENT} /> if the
          buff is about to fall off or if all other spells are on cooldown.
        </>,
      )
        .icon(SPELLS.WINDFURY_TOTEM_BUFF.icon)
        .actual(
          <>
            <SpellLink spell={SPELLS.WINDFURY_TOTEM_BUFF} /> was active for{' '}
            {formatPercentage(actual)}% of the fight
          </>,
        )
        .recommended(`recommended: ${formatPercentage(recommended)}%`),
    );
  }
}

export default WindfuryTotem;

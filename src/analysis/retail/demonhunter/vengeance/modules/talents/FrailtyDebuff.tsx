import { t } from '@lingui/macro';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class FrailtyDebuff extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FRAILTY_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOULCRUSH_TALENT);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FRAILTY.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
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
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.FRAILTY.id} /> uptime can be improved. This is easy to maintain
          and an important source of healing.
        </>,
      )
        .icon(SPELLS.FRAILTY.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.frailtyDebuff.uptime',
            message: `${formatPercentage(actual)}% Frailty uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>Total uptime was {formatDuration(this.enemies.getBuffUptime(SPELLS.FRAILTY.id))}.</>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FRAILTY_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FrailtyDebuff;

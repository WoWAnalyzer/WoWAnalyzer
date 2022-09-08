import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class VoidReaverDebuff extends Analyzer {
  //WCL: https://www.warcraftlogs.com/reports/LaMfJFHk2dY98gTj/#fight=20&type=auras&spells=debuffs&hostility=1&ability=268178
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.VOID_REAVER_VENGEANCE_TALENT.id,
    );
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VOID_REAVER_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> uptime can be improved.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.VOID_REAVER_VENGEANCE_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.voidReaver.uptime',
            message: `${formatPercentage(actual)}% Void Reaver uptime`,
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
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.VOID_REAVER_VENGEANCE_TALENT.id}>
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidReaverDebuff;

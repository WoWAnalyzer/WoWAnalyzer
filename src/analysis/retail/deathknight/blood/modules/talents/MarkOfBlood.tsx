import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class MarkOfBlood extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MARK_OF_BLOOD_TALENT);
  }

  get uptime() {
    return this.enemies.getBuffUptime(TALENTS.MARK_OF_BLOOD_TALENT.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
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
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.blood.markOfBlood.suggestion.suggestion">
          Your <SpellLink id={TALENTS.MARK_OF_BLOOD_TALENT.id} /> uptime can be improved.
        </Trans>,
      )
        .icon(TALENTS.MARK_OF_BLOOD_TALENT.icon)
        .actual(
          t({
            id: 'deathknight.blood.markOfBlood.suggestion.actual',
            message: `${formatPercentage(actual)}% Mark Of Blood Uptime`,
          }),
        )
        .recommended(
          t({
            id: 'shared.suggestion.recommended.moreThanPercent',
            message: `>${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spellId={TALENTS.MARK_OF_BLOOD_TALENT.id}>
          <Trans id="deathknight.blood.markOfBlood.statistic">
            <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MarkOfBlood;

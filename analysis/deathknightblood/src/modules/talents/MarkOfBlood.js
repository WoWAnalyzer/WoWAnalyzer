import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Uptime from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class MarkOfBlood extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.MARK_OF_BLOOD_TALENT.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> uptime can be improved.
        </>,
      )
        .icon(SPELLS.MARK_OF_BLOOD_TALENT.icon)
        .actual(
          t({
            id: 'deathknight.blood.suggestions.markOfBlood.uptime',
            message: `${formatPercentage(actual)}% Mark Of Blood Uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.MARK_OF_BLOOD_TALENT.id}>
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MarkOfBlood;

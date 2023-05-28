import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';

export default class DreadTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DREAD_TOUCH_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.2,
        average: 0.15,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should maintain <SpellLink id={SPELLS.DREAD_TOUCH_DEBUFF.id} /> as much as possible.
        </>,
      )
        .icon(SPELLS.DREAD_TOUCH_DEBUFF.icon)
        .actual(`${formatPercentage(actual)}% ${SPELLS.DREAD_TOUCH_DEBUFF.name} uptime`)
        .recommended(`at least ${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatPercentage(this.uptime)} uptime
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.DREAD_TOUCH_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.uptime)} % <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

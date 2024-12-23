import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

class CorruptionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      this.enemies.getBuffUptime(
        this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
          ? SPELLS.WITHER_DEBUFF.id
          : SPELLS.CORRUPTION_DEBUFF.id,
      ) / this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.CORRUPTION_CAST} /> uptime can be improved. Try to pay more
          attention to your Corruption on the boss, perhaps use some debuff tracker.
        </>,
      )
        .icon(SPELLS.CORRUPTION_CAST.icon)
        .actual(
          defineMessage({
            id: 'warlock.affliction.suggestions.corruption.uptime',
            message: `${formatPercentage(actual)}% Corruption uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
      ? this.enemies.getDebuffHistory(SPELLS.WITHER_DEBUFF.id)
      : this.enemies.getDebuffHistory(SPELLS.CORRUPTION_DEBUFF.id);
    const spell_icon = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
      ? SPELLS.WITHER_CAST
      : SPELLS.CORRUPTION_CAST;
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon spell={spell_icon} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default CorruptionUptime;

import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBar from 'parser/ui/StatisticBar';
import UptimeBar from 'parser/ui/UptimeBar';

class ImmolateUptime extends Analyzer {
  get uptime() {
    return (
      this.enemies.getBuffUptime(
        this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
          ? SPELLS.WITHER_DEBUFF.id
          : SPELLS.IMMOLATE_DEBUFF.id,
      ) / this.owner.fightDuration
    );
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.IMMOLATE_DEBUFF} /> uptime can be improved. Try to pay more
          attention to it as it provides a significant amount of Soul Shard Fragments over the fight
          and is also a big portion of your total damage.
        </>,
      )
        .icon(SPELLS.IMMOLATE_DEBUFF.icon)
        .actual(
          defineMessage({
            id: 'warlock.destruction.suggestions.immolate.uptime',
            message: `${formatPercentage(actual)}% Immolate uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    const history = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
      ? this.enemies.getDebuffHistory(SPELLS.WITHER_DEBUFF.id)
      : this.enemies.getDebuffHistory(SPELLS.IMMOLATE_DEBUFF.id);
    const spell_icon = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
      ? SPELLS.WITHER_CAST
      : SPELLS.IMMOLATE;
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        <div className="flex">
          <div className="flex-sub icon">
            <SpellIcon spell={spell_icon} />
          </div>
          <div className="flex-sub value">
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
      </StatisticBar>
    );
  }
}

export default ImmolateUptime;

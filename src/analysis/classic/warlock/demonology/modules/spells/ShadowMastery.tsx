import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import DebuffUptime from 'parser/shared/modules/DebuffUptime';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SPELL_COLORS } from '../../constants';

export default class ShadowMasteryUptime extends DebuffUptime {
  debuffSpell = SPELLS.SHADOW_MASTERY_DEBUFF;
  debuffColor = SPELL_COLORS.SHADOW_MASTERY;

  get debuffUptime(): number {
    return this.enemies.getBuffUptime(this.debuffSpell.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      // TODO: Query for total uptime on boss (see `useThreatTable` for example)
      // Shadow Mastery can be maintained by all Warlocks
      actual: this.debuffUptime,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Uptime on the <SpellLink id={this.debuffSpell} /> debuff can be improved. If there are
          multiple Warlocks in your raid, assign someone to keep up the debuff.
        </>,
      )
        .icon(this.debuffSpell.icon)
        .actual(`${formatPercentage(actual)}% ${this.debuffSpell.name} uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(this.debuffSpell.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [this.debuffSpell],
      uptimes: this.uptimeHistory,
      color: this.debuffColor,
      perf: this.DowntimePerformance,
    });
  }
}

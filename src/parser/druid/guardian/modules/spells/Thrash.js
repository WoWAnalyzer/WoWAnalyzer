import React from 'react';
import { formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { t } from '@lingui/macro';

class Thrash extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  statisticOrder = STATISTIC_ORDER.CORE(11);

  suggestions(when) {
    const thrashUptimePercentage = this.enemies.getBuffUptime(SPELLS.THRASH_BEAR_DOT.id) / this.owner.fightDuration;

    when(thrashUptimePercentage).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your <SpellLink id={SPELLS.THRASH_BEAR_DOT.id} /> uptime was {formatPercentage(thrashUptimePercentage)}%, unless you have extended periods of downtime it should be near 100%. <br />Thrash applies a bleed which buffs the damage of <SpellLink id={SPELLS.MANGLE_BEAR.id} /> by 20%.  Thrash uptime is especially important if you are talented into <SpellLink id={SPELLS.REND_AND_TEAR_TALENT.id} />, since it buffs the rest of your damage and gives you extra damage reduction.</span>)
        .icon(SPELLS.THRASH_BEAR.icon)
        .actual(t({
      id: "druid.guardian.suggestions.thrash.uptime",
      message: `${formatPercentage(thrashUptimePercentage)}% uptime`
    }))
        .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
        .regular(recommended - 0.05).major(recommended - 0.15));
  }

  statistic() {
    const thrashUptimePercentage = this.enemies.getBuffUptime(SPELLS.THRASH_BEAR_DOT.id) / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THRASH_BEAR.id} />}
        value={`${formatPercentage(thrashUptimePercentage)}%`}
        label="Thrash uptime"
      />
    );
  }
}

export default Thrash;

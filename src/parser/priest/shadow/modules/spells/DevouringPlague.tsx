import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import UptimeBar from 'parser/ui/UptimeBar';

class DevouringPlague extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DEVOURING_PLAGUE.id) / this.owner.fightDuration;
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.DEVOURING_PLAGUE.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.DEVOURING_PLAGUE.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
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

export default DevouringPlague;

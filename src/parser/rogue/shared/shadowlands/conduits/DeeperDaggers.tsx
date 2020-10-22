import React from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class DeeperDaggers extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.DEEPER_DAGGERS.id);
  }

  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DEEPER_DAGGERS_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible">
        <div className="pad">
          <label><SpellLink id={SPELLS.DEEPER_DAGGERS.id} /> Uptime</label>
          <div className="value">{formatPercentage(this.percentUptime)}%</div>
        </div>
      </Statistic>
    );
  }
}

export default DeeperDaggers;
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'parser/ui/Statistic';
import React from 'react';

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
          <label>
            <SpellLink id={SPELLS.DEEPER_DAGGERS.id} /> Uptime
          </label>
          <div className="value">{formatPercentage(this.percentUptime)}%</div>
        </div>
      </Statistic>
    );
  }
}

export default DeeperDaggers;

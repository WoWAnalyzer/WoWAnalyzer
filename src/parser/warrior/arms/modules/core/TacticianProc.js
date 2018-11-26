import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class TacticianProc extends Analyzer {

  totalProcs = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TACTICIAN), this._countTacticianProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TACTICIAN), this._countTacticianProc);
  }

  _countTacticianProc() {
    this.totalProcs += 1;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon id={SPELLS.TACTICIAN.id} />}
        value={this.totalProcs}
        label="Total Tactician Procs"
        tooltip={`Tactician resets the cooldown on Overpower. You got ${this.totalProcs} more Overpower casts.`}
      />
    );
  }
}

export default TacticianProc;

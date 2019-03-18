import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const BUFFER = 350;

class PowerSiphon extends Analyzer {
  _cast = null;
  _count = 0;
  casts = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_SIPHON_TALENT), this.handlePowerSiphonCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF), this.handleDemonicCore);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF), this.handleDemonicCore);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF), this.handleDemonicCore);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  handlePowerSiphonCast(event) {
    if (this._cast !== null) {
      this.casts.push(this._count);
    }
    this._cast = event.timestamp;
    this._count = 0;
  }

  handleDemonicCore(event) {
    if (this._cast && event.timestamp <= this._cast + BUFFER) {
      this._count += 1;
    }
  }

  onFinished() {
    this.casts.push(this._count);
  }

  get totalCores() {
    return this.casts.reduce((total, current) => total + current, 0);
  }
  get averageCores() {
    return (this.totalCores / this.casts.length) || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="small"
        tooltip={`Average Demonic Core stacks per cast: ${this.averageCores.toFixed(2)}`}
      >
        <BoringSpellValueText spell={SPELLS.POWER_SIPHON_TALENT}>
          {this.totalCores} <small>bonus Demonic Cores</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PowerSiphon;

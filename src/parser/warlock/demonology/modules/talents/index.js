import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';

import Dreadlash from './Dreadlash';
import DemonicStrength from './DemonicStrength';
import DemonicCalling from './DemonicCalling';
import GrimoireFelguard from './GrimoireFelguard';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    dreadlash: Dreadlash,
    demonicStrength: DemonicStrength,
    demonicCalling: DemonicCalling,
    grimoireFelguard: GrimoireFelguard,
  };

  constructor(...args) {
    super(...args);
    // active if at least one module is active and has subStatistic()
    this.active = Object.keys(this.constructor.dependencies)
      .filter(name => this[name].subStatistic)
      .map(name => this[name].active)
      .includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox
        position={STATISTIC_ORDER.CORE(4)}
        title="Talents">
        {
          Object.keys(this.constructor.dependencies)
            .map(name => this[name])
            .filter(module => module.active && module.subStatistic)
            .map(module => module.subStatistic())
        }
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;

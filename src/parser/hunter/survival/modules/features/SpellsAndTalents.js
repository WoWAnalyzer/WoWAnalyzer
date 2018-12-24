import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';
import SerpentSting from '../spells/SerpentSting';
import CoordinatedAssault from '../spells/CoordinatedAssault';

class SpellsAndTalents extends Analyzer {
  static dependencies = {
    serpentSting: SerpentSting,
    coordinatedAssault: CoordinatedAssault,
  };

  constructor(...args) {
    super(...args);
    // Deactivate this module if none of the underlying modules are active.
    this.active = Object.keys(this.constructor.dependencies)
      .map(key => this[key])
      .some(dependency => dependency.active);
  }

  statistic() {
    return (
      <StatisticsListBox
        position={STATISTIC_ORDER.CORE(12)}
        title="Spells and Talents"
        tooltip="This provides an overview of the damage contributions of various spells and talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.serpentSting.active && this.serpentSting.subStatistic()}
        {this.coordinatedAssault.active && this.coordinatedAssault.subStatistic()}
      </StatisticsListBox>

    );
  }
}

export default SpellsAndTalents;

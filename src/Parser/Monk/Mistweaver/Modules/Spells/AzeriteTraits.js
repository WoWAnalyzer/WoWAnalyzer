import React from 'react';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

import Analyzer from 'Parser/Core/Analyzer';

import FontOfLife from './AzeriteTraits/FontOfLife';
import UpliftedSpirits from './AzeriteTraits/UpliftedSpirits';
import InvigoratingBrew from './AzeriteTraits/InvigoratingBrew';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    fontOfLife: FontOfLife,
    upliftedSpirits: UpliftedSpirits,
    invigoratingBrew: InvigoratingBrew,
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
        title="Azerite Traits"
        tooltip="This provides an overview of the contributions of various azerite traits."
      >
        {this.fontOfLife.active && this.fontOfLife.subStatistic()}
        {this.upliftedSpirits.active && this.upliftedSpirits.subStatistic()}
        {this.invigoratingBrew.active && this.invigoratingBrew.subStatistic()}
      </StatisticsListBox>

    );
  }
}

export default TraitsAndTalents;

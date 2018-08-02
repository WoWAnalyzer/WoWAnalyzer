import React from 'react';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

import Analyzer from 'Parser/Core/Analyzer';

import AMurderOfCrows from 'Parser/Hunter/Shared/Modules/Talents/AMurderOfCrows';
import SerpentSting from '../Spells/SerpentSting';
import VipersVenom from '../Talents/VipersVenom';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    aMurderOfCrows: AMurderOfCrows,
    serpentSting: SerpentSting,
    vipersVenom: VipersVenom,
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
        title="Spells, Traits and Talents"
        tooltip="This provides an overview of the damage contributions of various talents and traits. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.serpentSting.active && this.serpentSting.subStatistic()}
        {this.vipersVenom.active && this.vipersVenom.subStatistic()}
        {}
      </StatisticsListBox>

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

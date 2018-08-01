import React from 'react';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

import Analyzer from 'Parser/Core/Analyzer';

import Barrage from 'Parser/Hunter/Shared/Modules/Talents/Barrage';
import BarbedShot from '../Spells/BarbedShot';
import BeastCleave from '../Spells/BeastCleave';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    beastCleave: BeastCleave,
    barrage: Barrage,
    barbedShot: BarbedShot,
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
        {this.barbedShot.active && this.barbedShot.subStatistic()}
        {this.barrage.active && this.barrage.subStatistic()}
        {this.beastCleave.active && this.beastCleave.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

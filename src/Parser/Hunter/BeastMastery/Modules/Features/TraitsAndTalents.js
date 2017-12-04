import React from 'react';

import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";

import Analyzer from 'Parser/Core/Analyzer';

import AMurderOfCrows from '../Talents/AMurderOfCrows';
import BestialFury from '../Talents/BestialFury';
import TitansThunder from '../Traits/TitansThunder';
import Stomp from '../Talents/Stomp';
import AspectOfTheBeast from '../Talents/AspectOfTheBeast';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    aMurderOfCrows: AMurderOfCrows,
    bestialFury: BestialFury,
    titansThunder: TitansThunder,
    stomp: Stomp,
    aspectOfTheBeast: AspectOfTheBeast,
  };

  on_initialized() {
    // Deactivate this module if none of the underlying modules are active.
    this.active = Object.keys(this.constructor.dependencies)
      .map(key => this[key])
      .some(dependency => dependency.active);
  }

  statistic() {
    return (
      <StatisticsListBox
        title="Traits and Talents"
        tooltip="This provides an overview of the damage contributions of various talents and traits"
      >
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.titansThunder.active && this.titansThunder.subStatistic()}
        {this.bestialFury.active && this.bestialFury.subStatistic()}
        {this.stomp.active && this.stomp.subStatistic()}
        {this.aspectOfTheBeast.active && this.aspectOfTheBeast.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(9);
}

export default TraitsAndTalents;

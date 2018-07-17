import React from 'react';

import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";

import Analyzer from 'Parser/Core/Analyzer';

import AMurderOfCrows from 'Parser/Hunter/Shared/Modules/Talents/AMurderOfCrows';
import Barrage from 'Parser/Hunter/Shared/Modules/Talents/Barrage';
import LoneWolf from '../Spells/LoneWolf';
import Volley from '../Talents/Volley';
import ExplosiveShot from '../Talents/ExplosiveShot';
import PiercingShot from '../Talents/PiercingShot';
import HuntersMark from '../Talents/HuntersMark';
import SerpentSting from '../Talents/SerpentSting';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    loneWolf: LoneWolf,
    volley: Volley,
    explosiveShot: ExplosiveShot,
    aMurderOfCrows: AMurderOfCrows,
    piercingShot: PiercingShot,
    barrage: Barrage,
    huntersMark: HuntersMark,
    serpentSting: SerpentSting,
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
        title="Traits and Talents"
        tooltip="This provides an overview of the damage contributions of various talents and traits. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.loneWolf.active && this.loneWolf.subStatistic()}
        {this.volley.active && this.volley.subStatistic()}
        {this.explosiveShot.active && this.explosiveShot.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.piercingShot.active && this.piercingShot.subStatistic()}
        {this.barrage.active && this.barrage.subStatistic()}
        {this.huntersMark.active && this.huntersMark.subStatistic()}
        {this.serpentSting.active && this.serpentSting.subStatistic()}
        {}
      </StatisticsListBox>

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

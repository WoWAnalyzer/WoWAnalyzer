import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';

import AMurderOfCrows from 'parser/hunter/shared/modules/talents/AMurderOfCrows';
import Barrage from 'parser/hunter/shared/modules/talents/Barrage';
import LoneWolf from '../spells/LoneWolf';
import Volley from '../talents/Volley';
import ExplosiveShot from '../talents/ExplosiveShot';
import PiercingShot from '../talents/PiercingShot';
import HuntersMark from '../talents/HuntersMark';
import SerpentSting from '../talents/SerpentSting';

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
        position={STATISTIC_ORDER.CORE(12)}
        title="Spells, Traits and Talents"
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
}

export default TraitsAndTalents;

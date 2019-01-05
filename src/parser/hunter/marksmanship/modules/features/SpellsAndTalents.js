import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';
import LoneWolf from '../spells/LoneWolf';
import Volley from '../talents/Volley';
import PiercingShot from '../talents/PiercingShot';
import HuntersMark from '../talents/HuntersMark';
import SerpentSting from '../talents/SerpentSting';
import PreciseShots from '../spells/PreciseShots';

class SpellsAndTalents extends Analyzer {
  static dependencies = {
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,
    volley: Volley,
    piercingShot: PiercingShot,
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
        title="Spells and Talents"
        tooltip="This provides an overview of the damage contributions of various spells and talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.loneWolf.active && this.loneWolf.subStatistic()}
        {this.preciseShots.active && this.preciseShots.subStatistic()}
        {this.volley.active && this.volley.subStatistic()}
        {this.piercingShot.active && this.piercingShot.subStatistic()}
        {this.huntersMark.active && this.huntersMark.subStatistic()}
        {this.serpentSting.active && this.serpentSting.subStatistic()}
      </StatisticsListBox>

    );
  }
}

export default SpellsAndTalents;

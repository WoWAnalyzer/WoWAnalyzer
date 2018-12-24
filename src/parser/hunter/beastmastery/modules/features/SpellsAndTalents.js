import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';
import ChimaeraShot from 'parser/hunter/beastmastery/modules/talents/ChimaeraShot';
import Stampede from 'parser/hunter/beastmastery/modules/talents/Stampede';
import KillerInstinct from 'parser/hunter/beastmastery/modules/talents/KillerInstinct';
import AspectOfTheBeast from 'parser/hunter/beastmastery/modules/talents/AspectOfTheBeast';
import BarbedShot from '../spells/BarbedShot';
import BeastCleave from '../spells/BeastCleave';

class SpellsAndTalents extends Analyzer {
  static dependencies = {
    beastCleave: BeastCleave,
    barbedShot: BarbedShot,
    killerInstinct: KillerInstinct,
    chimaeraShot: ChimaeraShot,
    stampede: Stampede,
    aspectOfTheBeast: AspectOfTheBeast,
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
        {this.barbedShot.active && this.barbedShot.subStatistic()}
        {this.beastCleave.active && this.beastCleave.subStatistic()}
        {this.killerInstinct.active && this.killerInstinct.subStatistic()}
        {this.chimaeraShot.active && this.chimaeraShot.subStatistic()}
        {this.stampede.active && this.stampede.subStatistic()}
        {this.aspectOfTheBeast.active && this.aspectOfTheBeast.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default SpellsAndTalents;

import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';

import Barrage from 'parser/hunter/shared/modules/talents/Barrage';
import ChimaeraShot from 'parser/hunter/beastmastery/modules/talents/ChimaeraShot';
import Stampede from 'parser/hunter/beastmastery/modules/talents/Stampede';
import Stomp from 'parser/hunter/beastmastery/modules/talents/Stomp';
import KillerInstinct from 'parser/hunter/beastmastery/modules/talents/KillerInstinct';
import BarbedShot from '../spells/BarbedShot';
import BeastCleave from '../spells/BeastCleave';
import AMurderOfCrows from '../../../shared/modules/talents/AMurderOfCrows';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    beastCleave: BeastCleave,
    barrage: Barrage,
    barbedShot: BarbedShot,
    killerInstinct: KillerInstinct,
    chimaeraShot: ChimaeraShot,
    stampede: Stampede,
    stomp: Stomp,
    aMurderOfCrows: AMurderOfCrows,
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
        {this.barbedShot.active && this.barbedShot.subStatistic()}
        {this.barrage.active && this.barrage.subStatistic()}
        {this.beastCleave.active && this.beastCleave.subStatistic()}
        {this.killerInstinct.active && this.killerInstinct.subStatistic()}
        {this.chimaeraShot.active && this.chimaeraShot.subStatistic()}
        {this.stampede.active && this.stampede.subStatistic()}
        {this.stomp.active && this.stomp.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default TraitsAndTalents;

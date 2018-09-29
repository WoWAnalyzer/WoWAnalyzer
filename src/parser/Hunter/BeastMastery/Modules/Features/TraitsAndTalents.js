import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';

import Barrage from 'parser/hunter/shared/modules/Talents/Barrage';
import ChimaeraShot from 'parser/hunter/beastmastery/modules/talents/ChimaeraShot';
import Stampede from 'parser/hunter/beastmastery/modules/talents/Stampede';
import Stomp from 'parser/hunter/beastmastery/modules/talents/Stomp';
import BarbedShot from '../spells/BarbedShot';
import BeastCleave from '../spells/BeastCleave';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    beastCleave: BeastCleave,
    barrage: Barrage,
    barbedShot: BarbedShot,
    chimaeraShot: ChimaeraShot,
    stampede: Stampede,
    stomp: Stomp,
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
        {this.chimaeraShot.active && this.chimaeraShot.subStatistic()}
        {this.stampede.active && this.stampede.subStatistic()}
        {this.stomp.active && this.stomp.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default TraitsAndTalents;

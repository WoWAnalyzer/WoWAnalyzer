import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import InfusionOfLight from './InfusionOfLight';
import LightsEmbrace from './LightsEmbrace';
import Shadowbind from './Shadowbind';
import ChaoticDarkness from './ChaoticDarkness';
import TormentTheWeak from './TormentTheWeak';
import DarkSorrows from './DarkSorrows';
import MasterOfShadows from './MasterOfShadows';

class NLCTraits extends Analyzer {
  static dependencies = {
    infusionOfLight: InfusionOfLight,
    lightsEmbrace: LightsEmbrace,
    shadowbind: Shadowbind,
    chaoticDarkness: ChaoticDarkness,
    tormentTheWeak: TormentTheWeak,
    darkSorrows: DarkSorrows,
    masterOfShadows: MasterOfShadows,
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
        title="Concordance and NLC"
        tooltip="This provides an overview of the benefits provided by Concordance of the Legionfall and the Netherlight Crucible traits."
      >
        {this.infusionOfLight.active && this.infusionOfLight.subStatistic()}
        {this.lightsEmbrace.active && this.lightsEmbrace.subStatistic()}
        {this.shadowbind.active && this.shadowbind.subStatistic()}
        {this.chaoticDarkness.active && this.chaoticDarkness.subStatistic()}
        {this.tormentTheWeak.active && this.tormentTheWeak.subStatistic()}
        {this.darkSorrows.active && this.darkSorrows.subStatistic()}
        {this.masterOfShadows.active && this.masterOfShadows.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2000);
}

export default NLCTraits;

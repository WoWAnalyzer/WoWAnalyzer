import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import MurderousIntent from './MurderousIntent';
import RefractiveShell from './RefractiveShell';
import Shocklight from './Shocklight';
import SecureInTheLight from './SecureInTheLight';
import InfusionOfLight from './InfusionOfLight';
import LightsEmbrace from './LightsEmbrace';
import Shadowbind from './Shadowbind';
import ChaoticDarkness from './ChaoticDarkness';
import TormentTheWeak from './TormentTheWeak';
import DarkSorrows from './DarkSorrows';

class NLCTraits extends Analyzer {
  static dependencies = {
    murderousIntent: MurderousIntent,
    refractiveShell: RefractiveShell,
    shocklight: Shocklight,
    secureInTheLight: SecureInTheLight,
    infusionOfLight: InfusionOfLight,
    lightsEmbrace: LightsEmbrace,
    shadowbind: Shadowbind,
    chaoticDarkness: ChaoticDarkness,
    tormentTheWeak: TormentTheWeak,
    darkSorrows: DarkSorrows,
  };

  on_initialized() {
    // Deactive this module if none of the underlying modules are active.
      this.active = Object.keys(this.constructor.dependencies)
      .map(key => this[key])
      .some(dependency => dependency.active);
  }

  statistic() {
    return (
      <StatisticsListBox
        title="Netherlight Crucible"
        tooltip="This provides an overview of the benefits provided by the Netherlight Crucible traits."
      >
        {this.murderousIntent.active && this.murderousIntent.subStatistic()}
        {this.shocklight.active && this.shocklight.subStatistic()}
        {this.refractiveShell.active && this.refractiveShell.subStatistic()}
        {this.secureInTheLight.active && this.secureInTheLight.subStatistic()}
        {this.infusionOfLight.active && this.infusionOfLight.subStatistic()}
        {this.lightsEmbrace.active && this.lightsEmbrace.subStatistic()}
        {this.shadowbind.active && this.shadowbind.subStatistic()}
        {this.chaoticDarkness.active && this.chaoticDarkness.subStatistic()}
        {this.tormentTheWeak.active && this.tormentTheWeak.subStatistic()}
        {this.darkSorrows.active && this.darkSorrows.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2000);
}

export default NLCTraits;

import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Module from 'Parser/Core/Module';

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

class RelicTraits extends Module {
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

  statistic() {
    return (
      <StatisticsListBox
        title="Netherlight Crucible"
        tooltip="This provides an overview of the increased provide by the Netherlight Crucible traits."
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
  statisticOrder = STATISTIC_ORDER.TRAITS(5);
}

export default RelicTraits;

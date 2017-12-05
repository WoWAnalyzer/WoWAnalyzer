import React from 'react';
import StatisticsListBox from 'Main/StatisticsListBox';

import CoreNLCTraits from "Parser/Core/Modules//NetherlightCrucibleTraits/NLCTraits";
import LightSpeed from "./LightSpeed";
import MasterOfShadows from "./MasterOfShadows";

class NLCTraits extends CoreNLCTraits {
  static dependencies = {
    ...CoreNLCTraits.dependencies,
    lightSpeed: LightSpeed,
    masterOfShadows: MasterOfShadows,
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
        {this.lightSpeed.active && this.lightSpeed.subStatistic()}
        {this.masterOfShadows.active && this.masterOfShadows.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default NLCTraits;

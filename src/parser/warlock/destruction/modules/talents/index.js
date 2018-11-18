import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import StatisticsListBox from 'interface/others/StatisticsListBox';

import GrimoireOfSacrifice from 'parser/warlock/shared/modules/talents/GrimoireOfSacrifice';
import Flashover from './Flashover';
import Eradication from './Eradication';
import SoulFire from './SoulFire';
import ReverseEntropy from './ReverseEntropy';
import InternalCombustion from './InternalCombustion';
import Shadowburn from './Shadowburn';
import Inferno from './Inferno';
import FireAndBrimstone from './FireAndBrimstone';
import Cataclysm from './Cataclysm';
import RoaringBlaze from './RoaringBlaze';
import GrimoireOfSupremacy from './GrimoireOfSupremacy';
import SoulConduit from './SoulConduit';
import ChannelDemonfire from './ChannelDemonfire';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    flashover: Flashover,
    eradication: Eradication,
    soulFire: SoulFire,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    inferno: Inferno,
    fireAndBrimstone: FireAndBrimstone,
    cataclysm: Cataclysm,
    roaringBlaze: RoaringBlaze,
    grimoireOfSupremacy: GrimoireOfSupremacy,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,
    channelDemonfire: ChannelDemonfire,
  };

  constructor(...args) {
    super(...args);
    this.active = Object.keys(this.constructor.dependencies)
      .map(name => this[name].active)
      .includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox title="Talents">
        {Object.keys(this.constructor.dependencies).map(name => {
          const module = this[name];
          if (!module.active) {
            return null;
          }
          return (
            <React.Fragment key={name}>
              {module.subStatistic()}
            </React.Fragment>
          );
        })}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;

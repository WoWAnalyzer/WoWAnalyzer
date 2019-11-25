import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
// Talents
import AngerManagement from './AngerManagement';
import Skullsplitter from './Skullsplitter';
import SuddenDeath from './SuddenDeath';
import WarMachine from './WarMachine';
import StormBolt from './StormBolt';
import ImpendingVictory from './ImpendingVictory';
import FervorOfBattle from './FervorOfBattle';
import SecondWind from './SecondWind';
import Cleave from './Cleave';
import Warbreaker from './Warbreaker';
import Avatar from './Avatar';
import Ravager from './Ravager';

// Rend statistics are in '../core/Dots'

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    skullsplitter: Skullsplitter,
    suddenDeath: SuddenDeath,
    warMachine: WarMachine,
    stormBolt: StormBolt,
    impendingVictory: ImpendingVictory,
    fervorOfBattle: FervorOfBattle,
    secondWind: SecondWind,
    cleave: Cleave,
    warbreaker: Warbreaker,
    avatar: Avatar,
    angerManagement: AngerManagement,
    ravager: Ravager,
  };

  constructor(...args) {
    super(...args);
    this.active = Object.keys(this.constructor.dependencies)
      .map(name => this[name].active)
      .includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox
        title="Talents"
        position={STATISTIC_ORDER.CORE(2)}
        tooltip="This provides an overview of the damage contributions of various talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
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

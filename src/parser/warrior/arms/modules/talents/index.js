import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';

import AngerManagement from './AngerManagement';
import Skullsplitter from './Skullsplitter';
import SuddenDeath from './SuddenDeath';
import WarMachine from './WarMachine';
import StormBolt from './StormBolt';
import ImpendingVictory from './ImpendingVictory';
//import FervorOfBattle from './FervorOfBattle';
import SecondWind from './SecondWind';
import Cleave from './Cleave';
import Warbreaker from './Warbreaker';
import Avatar from './Avatar';
import Ravager from './Ravager';

// Rend statistics are in '../core/Dots'
// TODO: Fervor of Battle -> Slam damage

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    skullsplitter: Skullsplitter,
    suddenDeath: SuddenDeath,
    warMachine: WarMachine,
    stormBolt: StormBolt,
    impendingVictory: ImpendingVictory,
    //fervorOfBattle: FervorOfBattle,
    secondWind: SecondWind,
    cleave: Cleave,
    warbreaker: Warbreaker,
    avatar: Avatar,
    angerManagement: AngerManagement,
    ravager: Ravager,
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
        position={STATISTIC_ORDER.CORE(2)}
        title="Talents"
        tooltip="This provides an overview of the damage contributions of various talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.skullsplitter.active && this.skullsplitter.subStatistic()}
        {this.suddenDeath.active && this.suddenDeath.subStatistic()}
        {this.warMachine.active && this.warMachine.subStatistic()}
        {this.stormBolt.active && this.stormBolt.subStatistic()}
        {this.impendingVictory.active && this.impendingVictory.subStatistic()}
        {this.secondWind.active && this.secondWind.subStatistic()}
        {this.cleave.active && this.cleave.subStatistic()}
        {this.warbreaker.active && this.warbreaker.subStatistic()}
        {this.avatar.active && this.avatar.subStatistic()}
        {this.angerManagement.active && this.angerManagement.subStatistic()}
        {this.ravager.active && this.ravager.subStatistic()}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;

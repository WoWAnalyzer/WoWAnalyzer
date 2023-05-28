//import Analyzer from 'parser/core/Analyzer';
//import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
//import { Fragment } from 'react';

//// Talents
//import AngerManagement from './AngerManagement';
//import Avatar from './Avatar';
//import Cleave from './Cleave';
//import FervorOfBattle from './FervorOfBattle';
//import ImpendingVictory from './ImpendingVictory';
////import Ravager from './Ravager';
//import SecondWind from './SecondWind';
//import Skullsplitter from './Skullsplitter';
//import StormBolt from './StormBolt';
//import SuddenDeath from './SuddenDeath';
//import Warbreaker from './Warbreaker';
//import WarMachine from './WarMachine';

//// Rend statistics are in '../core/Dots'

//class TalentStatisticBox extends Analyzer {
//  static dependencies = {
//    skullsplitter: Skullsplitter,
//    suddenDeath: SuddenDeath,
//    warMachine: WarMachine,
//    stormBolt: StormBolt,
//    impendingVictory: ImpendingVictory,
//    fervorOfBattle: FervorOfBattle,
//    secondWind: SecondWind,
//    cleave: Cleave,
//    warbreaker: Warbreaker,
//    avatar: Avatar,
//    angerManagement: AngerManagement,
//    ravager: Ravager,
//  };

//  constructor(...args) {
//    super(...args);
//    this.active = Object.keys(this.constructor.dependencies)
//      .map((name) => this[name].active)
//      .includes(true);
//  }

//  statistic() {
//    return (
//      <StatisticsListBox
//        title="Talents"
//        position={STATISTIC_ORDER.CORE(2)}
//        tooltip="This provides an overview of the damage contributions of various talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
//      >
//        {Object.keys(this.constructor.dependencies).map((name) => {
//          const module = this[name];
//          if (!module.active) {
//            return null;
//          }
//          return <Fragment key={name}>{module.subStatistic()}</Fragment>;
//        })}
//      </StatisticsListBox>
//    );
//  }
//}

//export default TalentStatisticBox;

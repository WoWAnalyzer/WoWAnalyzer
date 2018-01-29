import React from 'react';

import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";

import Analyzer from 'Parser/Core/Analyzer';

import Barrage from 'Parser/Hunter/Shared/Modules/Talents/Barrage';
import Volley from 'Parser/Hunter/Shared/Modules/Talents/Volley';
import AMurderOfCrows from '../Talents/AMurderOfCrows';
import BestialFury from '../Talents/BestialFury';
import TitansThunder from '../Traits/TitansThunder';
import Stomp from '../Talents/Stomp';
import AspectOfTheBeast from '../../../Shared/Modules/Talents/AspectOfTheBeast';
import ChimaeraShot from '../Talents/ChimaeraShot';
import WayOfTheCobra from '../Talents/WayOfTheCobra';
import BlinkStrikes from '../Talents/BlinkStrikes';
import DireFrenzy from '../Talents/DireFrenzy';
import Stampede from '../Talents/Stampede';
import CobraCommander from '../Traits/CobraCommander';
import BeastCleave from '../Spells/BeastCleave';
import SurgeOfTheStormgod from '../Traits/SurgeOfTheStormgod';
import Thunderslash from '../Traits/Thunderslash';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    aMurderOfCrows: AMurderOfCrows,
    bestialFury: BestialFury,
    titansThunder: TitansThunder,
    stomp: Stomp,
    aspectOfTheBeast: AspectOfTheBeast,
    cobraCommander: CobraCommander,
    beastCleave: BeastCleave,
    surgeOfTheStormgod: SurgeOfTheStormgod,
    thunderslash: Thunderslash,
    barrage: Barrage,
    volley: Volley,
    chimaeraShot: ChimaeraShot,
    wayOfTheCobra: WayOfTheCobra,
    blinkStrikes: BlinkStrikes,
    direFrenzy: DireFrenzy,
    stampede: Stampede,
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
        title="Traits and Talents"
        tooltip="This provides an overview of the damage contributions of various talents and traits"
      >
        {this.wayOfTheCobra.active && this.wayOfTheCobra.subStatistic()}
        {this.stomp.active && this.stomp.subStatistic()}
        {this.chimaeraShot.active && this.chimaeraShot.subStatistic()}
        {this.direFrenzy.active && this.direFrenzy.subStatistic()}
        {this.bestialFury.active && this.bestialFury.subStatistic()}
        {this.blinkStrikes.active && this.blinkStrikes.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.barrage.active && this.barrage.subStatistic()}
        {this.volley.active && this.volley.subStatistic()}
        {this.aspectOfTheBeast.active && this.aspectOfTheBeast.subStatistic()}
        {this.stampede.active && this.stampede.subStatistic()}
        {this.beastCleave.active && this.beastCleave.subStatistic()}
        {this.titansThunder.active && this.titansThunder.subStatistic()}
        {this.cobraCommander.active && this.cobraCommander.subStatistic()}
        {this.surgeOfTheStormgod.active && this.surgeOfTheStormgod.subStatistic()}
        {this.thunderslash.active && this.thunderslash.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

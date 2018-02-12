import React from 'react';

import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";

import Analyzer from 'Parser/Core/Analyzer';

import AMurderOfCrows from '../Talents/AMurderOfCrows';
import ExplosiveShot from '../Talents/ExplosiveShot';
import PiercingShot from '../Talents/PiercingShot';
import TrickShot from '../Talents/TrickShot/TrickShot';
import TrickShotCleave from '../Talents/TrickShot/TrickShotCleave';
import Volley from '../../../Shared/Modules/Talents/Volley';
import TrueAim from '../Talents/TrueAim';
import Sidewinders from '../Talents/Sidewinders';
import Barrage from '../../../Shared/Modules/Talents/Barrage';
import BlackArrow from '../Talents/BlackArrow';
import LoneWolf from '../Talents/LoneWolf';
import CarefulAim from '../Talents/CarefulAim';
import CyclonicBurst from '../Traits/CyclonicBurst';
import CallOfTheHunter from '../Traits/CallOfTheHunter';
import LegacyOfTheWindrunners from '../Traits/LegacyOfTheWindrunners';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    aMurderOfCrows: AMurderOfCrows,
    explosiveShot: ExplosiveShot,
    piercingShot: PiercingShot,
    trickShot: TrickShot,
    trickShotCleave: TrickShotCleave,
    volley: Volley,
    trueAim: TrueAim,
    sidewinders: Sidewinders,
    barrage: Barrage,
    blackArrow: BlackArrow,
    loneWolf: LoneWolf,
    carefulAim: CarefulAim,
    cyclonicBurst: CyclonicBurst,
    callOfTheHunter: CallOfTheHunter,
    legacyOfTheWindrunners: LegacyOfTheWindrunners,
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
        tooltip="This provides an overview of the damage contributions of various talents and traits. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage. Sidewinders is the most obvious example of this for Marksmanship hunters."
      >
        {this.loneWolf.active && this.loneWolf.subStatistic()}
        {this.trueAim.active && this.trueAim.subStatistic()}
        {this.trickShot.active && this.trickShot.subStatistic()}
        {this.trickShotCleave.active && this.trickShotCleave.subStatistic()}
        {this.piercingShot.active && this.piercingShot.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.volley.active && this.volley.subStatistic()}
        {this.explosiveShot.active && this.explosiveShot.subStatistic()}
        {this.sidewinders.active && this.sidewinders.subStatistic()}
        {this.barrage.active && this.barrage.subStatistic()}
        {this.blackArrow.active && this.blackArrow.subStatistic()}
        {this.carefulAim.active && this.carefulAim.subStatistic()}
        {this.legacyOfTheWindrunners.active && this.legacyOfTheWindrunners.subStatistic()}
        {this.cyclonicBurst.active && this.cyclonicBurst.subStatistic()}
        {this.callOfTheHunter.active && this.callOfTheHunter.subStatistic()}
      </StatisticsListBox>

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

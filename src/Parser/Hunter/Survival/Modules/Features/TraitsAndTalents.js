import React from 'react';

import StatisticsListBox from 'Main/StatisticsListBox';
import STATISTIC_ORDER from "Main/STATISTIC_ORDER";

import Analyzer from 'Parser/Core/Analyzer';

import Caltrops from 'Parser/Hunter/Survival/Modules/Talents/Caltrops';
import SteelTrap from 'Parser/Hunter/Survival/Modules/Talents/SteelTrap';
import ExplosiveTrap from 'Parser/Hunter/Survival/Modules/Spells/ExplosiveTrap';
import AspectOfTheBeast from 'Parser/Hunter/Shared/Modules/Talents/AspectOfTheBeast';
import SerpentSting from 'Parser/Hunter/Survival/Modules/Talents/SerpentSting';
import AMurderOfCrows from 'Parser/Hunter/Survival/Modules/Talents/AMurderOfCrows';
import DragonsfireGrenade from 'Parser/Hunter/Survival/Modules/Talents/DragonsfireGrenade';
import ThrowingAxes from 'Parser/Hunter/Survival/Modules/Talents/ThrowingAxes';
import EaglesBite from 'Parser/Hunter/Survival/Modules/Traits/EaglesBite';
import TalonStrike from 'Parser/Hunter/Survival/Modules/Traits/TalonStrike';
import TalonBond from 'Parser/Hunter/Survival/Modules/Traits/TalonBond';
import EchoesOfOhnara from 'Parser/Hunter/Survival/Modules/Traits/EchoesOfOhnara';
import AspectOfTheSkylord from 'Parser/Hunter/Survival/Modules/Traits/AspectOfTheSkylord';
import Butchery from 'Parser/Hunter/Survival/Modules/Talents/ButcheryCarve';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    caltrops: Caltrops,
    steelTrap: SteelTrap,
    explosiveTrap: ExplosiveTrap,
    aspectOfTheBeast: AspectOfTheBeast,
    serpentSting: SerpentSting,
    aMurderOfCrows: AMurderOfCrows,
    dragonsfireGrenade: DragonsfireGrenade,
    throwingAxes: ThrowingAxes,
    butchery: Butchery,

    //traits
    eaglesBite: EaglesBite,
    talonStrike: TalonStrike,
    talonBond: TalonBond,
    echoesOfOhnara: EchoesOfOhnara,
    aspectOfTheSkylord: AspectOfTheSkylord,
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
        tooltip="This provides an overview of the damage contributions of various talents and traits. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.caltrops.active && this.caltrops.subStatistic()}
        {this.butchery.active && this.butchery.subStatistic()}
        {this.steelTrap.active && this.steelTrap.subStatistic()}
        {this.explosiveTrap.active && this.explosiveTrap.subStatistic()}
        {this.aspectOfTheBeast.active && this.aspectOfTheBeast.subStatistic()}
        {this.serpentSting.active && this.serpentSting.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.dragonsfireGrenade.active && this.dragonsfireGrenade.subStatistic()}
        {this.throwingAxes.active && this.throwingAxes.subStatistic()}
        {this.eaglesBite.active && this.eaglesBite.subStatistic()}
        {this.echoesOfOhnara.active && this.echoesOfOhnara.subStatistic()}
        {this.aspectOfTheSkylord.active && this.aspectOfTheSkylord.subStatistic()}
        {this.talonStrike.active && this.talonStrike.subStatistic()}
        {this.talonBond.active && this.talonBond.subStatistic()}
      </StatisticsListBox>

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default TraitsAndTalents;

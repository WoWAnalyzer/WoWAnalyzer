import React from 'react';

import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import Analyzer from 'parser/core/Analyzer';

import AMurderOfCrows from 'parser/hunter/shared/modules/Talents/AMurderOfCrows';
import SteelTrap from '../talents/SteelTrap';
import SerpentSting from '../spells/SerpentSting';
import VipersVenom from '../talents/VipersVenom';
import ButcheryCarve from '../spells/ButcheryCarve';
import MongooseBite from '../talents/MongooseBite';

class TraitsAndTalents extends Analyzer {
  static dependencies = {
    aMurderOfCrows: AMurderOfCrows,
    serpentSting: SerpentSting,
    vipersVenom: VipersVenom,
    butcheryCarve: ButcheryCarve,
    steelTrap: SteelTrap,
    mongooseBite: MongooseBite,
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
        position={STATISTIC_ORDER.CORE(12)}
        title="Spells, Traits and Talents"
        tooltip="This provides an overview of the damage contributions of various talents and traits. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      >
        {this.mongooseBite.active && this.mongooseBite.subStatistic()}
        {this.aMurderOfCrows.active && this.aMurderOfCrows.subStatistic()}
        {this.serpentSting.active && this.serpentSting.subStatistic()}
        {this.vipersVenom.active && this.vipersVenom.subStatistic()}
        {this.butcheryCarve.active && this.butcheryCarve.subStatistic()}
        {this.steelTrap.active && this.steelTrap.subStatistic()}
      </StatisticsListBox>

    );
  }
}

export default TraitsAndTalents;

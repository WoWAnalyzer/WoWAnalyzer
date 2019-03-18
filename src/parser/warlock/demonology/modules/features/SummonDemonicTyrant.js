import React from 'react';

import Analyzer , {SELECTED_PLAYER} from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

import DemonicTyrantStatistic from './DemonicTyrantStatistic';
import DemoPets from '../pets/DemoPets';

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _petsPerCast = [];


  constructor(...args){
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT), this.summonDemonicTyrantCast);
  }

  summonDemonicTyrantCast() {
    const pets = this.demoPets.currentPets;
    const countsPerCast = {};

    pets.forEach(pet => {
      if (pet.summonedBy === SPELLS.SUMMON_DEMONIC_TYRANT.id) {
        // skip Demonic Tyrant (it's the one that *empowers*, not that *gets empowered*), it sometimes gets counted, sometimes not
        return;
      }
      countsPerCast[pet.summonedBy] = (countsPerCast[pet.summonedBy] || 0) + 1;
    });

    this._petsPerCast.push(countsPerCast);
  }

  statistic() {
    const totalPets = this._petsPerCast.reduce((total, cast) => {
      const petsInCast = Object.values(cast).reduce((castTotal, count) => castTotal + count, 0);
      return total + petsInCast;
    }, 0);
    const averagePets = (totalPets / this._petsPerCast.length) || 0;

    const mergedPets = {};
    this._petsPerCast.forEach(cast => {
      Object.entries(cast).forEach(([source, value]) => {
        mergedPets[source] = (mergedPets[source] || 0) + value;
      });
    });

    const averagePetsPerCast = {};
    Object.entries(mergedPets).forEach(([source, count]) => {
      averagePetsPerCast[source] = (count / this._petsPerCast.length) || 0;
    });

    return (
      <DemonicTyrantStatistic pets={averagePetsPerCast} average={averagePets} casts={this._petsPerCast.length} />
    );
  }
}

export default SummonDemonicTyrant;

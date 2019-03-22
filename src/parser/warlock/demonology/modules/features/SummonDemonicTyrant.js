import React from 'react';

import Analyzer , {SELECTED_PLAYER} from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import DemoPets from '../pets/DemoPets';
import { isWildImp } from '../pets/helpers';



class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demonicTyrantPower = [];
  _hasDemonicConsumption = false;

  _petsPerCast = [];


  constructor(...args){
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT), this.summonDemonicTyrantCast);
    this._hasDemonicConsumption = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CONSUMPTION_TALENT.id);
  }

  summonDemonicTyrantCast(event) {
    const pets = this.demoPets.currentPets;
    const countsPerCast = {};
    let tyrantPower = 0;
    pets.forEach(pet => {
      if (isWildImp(pet.guid)) {
        tyrantPower += pet.currentEnergy / 2;
      }
      countsPerCast[pet.summonedBy] = (countsPerCast[pet.summonedBy] || 0) + 1;
    });

    this.demonicTyrantPower.push(tyrantPower);
    this._petsPerCast.push(countsPerCast);
  }


  statistic() {
    const avgPets = (this._petsPerCast.reduce((total, cast) =>
      total + Object.values(cast).reduce((totalPerSource, source) =>
        totalPerSource + source, 0)
      , 0) / this._petsPerCast.length) || 0;
    const mergedPets = {};
    this._petsPerCast.forEach(cast => {
      Object.keys(cast).forEach(demonSource => {
        mergedPets[demonSource] = (mergedPets[demonSource] || 0) + cast[demonSource];
      });
    });

    const petTableRows = [];
    Object.keys(mergedPets).forEach(demonSource => {
      petTableRows.push(
        <tr key={demonSource}>
          <td><SpellLink id={Number(demonSource)} /></td>
          <td>{(mergedPets[demonSource]/this._petsPerCast.length).toFixed(2)}</td>
        </tr>
      );
    });

    const avgTyrantPower = (this.demonicTyrantPower.reduce((acc, val) => acc + val)) / this.demonicTyrantPower.length;
    const tyrantFooter = this._hasDemonicConsumption ? `Average demonic consumption power: ${avgTyrantPower.toFixed(2)}` : "";

    const petTable = (this._petsPerCast.length > 0) ? (
      <>
        <thead>
          <tr>
            <th>Pet Source</th>
            <th>Average Pets Per Cast</th>
          </tr>
        </thead>
        <tbody>
          {petTableRows}
        </tbody>
      </>
    ) : null;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SUMMON_DEMONIC_TYRANT.id} />}
        value={`${avgPets.toFixed(2)}`} // Rather than formatNumber, because this value will always be low and the decimal points matter.
        footer={`${tyrantFooter}`}
        label={`Average Demons Empowered`}
        tooltip={`Number of pets empowered by each Demonic Tyrant summon.`}
      >
        <table className="table table-condensed" style={{fontWeight: 'bold'}}>
          {petTable}
        </table>
      </StatisticBox>
    );
  }
}

export default SummonDemonicTyrant;

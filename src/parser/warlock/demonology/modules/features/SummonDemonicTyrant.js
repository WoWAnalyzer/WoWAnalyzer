import React from 'react';

import Analyzer , {SELECTED_PLAYER} from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import DemoPets from '../pets/DemoPets';
import { isWildImp, isDreadstalker, isVilefiend, isPermanentPet } from '../pets/helpers';

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _petsPerCast = [];

  _dreadstalkersPerCast = [];
  _impsPerCast = [];
  _vilefiendsPerCast = [];
  _permPetsPerCast = [];

  constructor(...args){
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT), this.summonDemonicTyrantCast);
  }

  summonDemonicTyrantCast(event) {
    const pets = this.demoPets.currentPets;

    let numDSs = 0;
    let numImps = 0;
    let numVilefiends = 0;
    let numPerm = 0;
    pets.forEach(p => {
      if(isWildImp(p.guid)) {
        numImps += 1;
      } else if (isDreadstalker(p.guid)) {
        numDSs += 1;
      } else if (isVilefiend(p.guid)) {
        numVilefiends += 1;
      } else if (isPermanentPet(p.guid)) {
        numPerm += 1;
      }
    });
    this._dreadstalkersPerCast.push(numDSs);
    this._impsPerCast.push(numImps);
    this._vilefiendsPerCast.push(numVilefiends);
    this._permPetsPerCast.push(numPerm);

    this._petsPerCast.push(numDSs + numImps + numVilefiends + numPerm);
  }


  statistic() {
    const avgPets = this._petsPerCast.reduce((total, num) => total + num, 0) /
      (this._petsPerCast.length === 0 ? 1 : this._petsPerCast.length);
    const hasVilefiendTalent = this.selectedCombatant.hasTalent(SPELLS.SUMMON_VILEFIEND_TALENT.id);

    const petTableRows = [];
    for(let i = 0; i < this._petsPerCast.length; i++){
      petTableRows.push(
        <tr key={i}>
          <td>{this._permPetsPerCast[i]}</td>
          <td>{this._dreadstalkersPerCast[i]}</td>
          <td>{this._impsPerCast[i]}</td>
          {hasVilefiendTalent && <td>{this._vilefiendsPerCast[i]}</td>}
        </tr>
      );
    }

    const petTable = (this._petsPerCast.length > 0) ? (
      <>
        <thead>
          <tr>
            <th>Perm. Pets</th>
            <th>Dreadstalkers</th>
            <th>Imps</th>
            {hasVilefiendTalent && <th>Vilefiends</th>}
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
        value={`${avgPets.toFixed(2)} Demons Empowered Per Cast`} // Rather than formatNumber, because this value will always be low and the decimal points matter.
        label={`Summon Demonic Tyrant`}
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

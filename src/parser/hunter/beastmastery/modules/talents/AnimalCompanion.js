import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

/**
 * Your Call Pet additionally summons the first pet from your stable.
 * This pet will obey your Kill Command, but cannot use pet family abilities.
 *
 * Additionally this talent baseline reduces all pet damage by 40%.
 *
 * Example log: https://www.warcraftlogs.com/reports/aNRJKvknX1FYqQ6G#fight=4&type=damage-done&source=7
 */

class AnimalCompanion extends Analyzer {
  damage = 0;
  pets = [];
  mainPetName = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANIMAL_COMPANION_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const foundPet = this.pets.find(pet => pet.sourceID === event.sourceID);
    const damage = event.amount + (event.absorbed || 0);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find(pet => pet.id === event.sourceID);
      this.pets.push({ petName: sourcePet.name, sourceID: event.sourceID, damage: damage });
    } else {
      foundPet.damage += damage;
    }
  }

  on_fightend() {
    let max = 0;
    this.pets.forEach(pet => {
      if (pet.damage > max) {
        max = pet.damage;
        this.mainPetName = pet.petName;
      }
    });
  }

  statistic() {
    const totalDamage = this.pets.map(pet => pet.damage).reduce((total, current) => total + current, 0);
    return (
      <TalentStatisticBox
        talent={SPELLS.ANIMAL_COMPANION_TALENT.id}
        value={<>{formatNumber(totalDamage)} / {formatNumber(totalDamage / (this.owner.fightDuration / 1000))} DPS</>}
        label="Animal Companion"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Dmg</th>
              <th>DPS</th>
              <th>Dmg without AC</th>
            </tr>
          </thead>
          <tbody>
            {this.pets.map((pet, idx) => (
              <tr key={idx}>
                <td>{pet.petName}</td>
                <td>{formatNumber(pet.damage)}</td>
                <td>{formatNumber(pet.damage / (this.owner.fightDuration / 1000))}</td>
                <td>{pet.petName === this.mainPetName ? formatNumber(pet.damage / 0.6) + ' / ' + formatNumber((pet.damage / 0.6) / (this.owner.fightDuration / 1000)) + ' DPS' : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default AnimalCompanion;

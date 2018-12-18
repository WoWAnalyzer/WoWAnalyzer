import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';

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
    const sourcePet = this.owner.playerPets.find(pet => pet.id === event.sourceID);
    const foundPet = this.pets.find(pet => pet.sourceID === event.sourceID);
    const damage = event.amount + (event.absorbed || 0);
    if (!foundPet) {
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
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ANIMAL_COMPANION_TALENT.id} />}
        value={<>{formatNumber(totalDamage)} / {formatNumber(totalDamage / (this.owner.fightDuration / 1000))} DPS</>}
        label="Animal Companion"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Damage</th>
              <th>DPS</th>
              <th>Main pet?</th>
            </tr>
          </thead>
          <tbody>
            {this.pets.map((pet, idx) => (
              <tr key={idx}>
                <td>{pet.petName}</td>
                <td>{formatNumber(pet.damage)}</td>
                <td>{formatNumber(pet.damage / (this.owner.fightDuration / 1000))}</td>
                <td>{pet.petName === this.mainPetName ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default AnimalCompanion;

import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import PackAlpha from 'parser/hunter/beastmastery/modules/spells/azeritetraits/PackAlpha';

/**
 * Your Call Pet additionally summons the first pet from your stable.
 * This pet will obey your Kill Command, but cannot use pet family abilities.
 *
 * Additionally this talent baseline reduces all pet damage by 40%.
 *
 * Example log: https://www.warcraftlogs.com/reports/aNRJKvknX1FYqQ6G#fight=4&type=damage-done&source=7
 */

class AnimalCompanion extends Analyzer {
  static dependencies = {
    packAlpha: PackAlpha,
  };
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
      const indexOfPet = this.pets.findIndex(index => index.sourceID === event.sourceID);
      this.pets[indexOfPet].damage += damage;
    }
  }

  on_finished() {
    let max = -Infinity;
    let x;
    for (x in this.pets) {
      if (this.pets[x].damage > max) {
        max = this.pets[x].damage;
        this.mainPetName = this.pets[x].petName;
      }
    }
  }

  statistic() {
    const totalDamage = this.pets.reduce((totalDamage, petDamage) => ({ damage: totalDamage.damage + petDamage.damage }));
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ANIMAL_COMPANION_TALENT.id} />}
        value={<>{formatNumber(totalDamage.damage)} / {formatNumber(totalDamage.damage / (this.owner.fightDuration / 1000))} DPS</>}
        label="Animal Companion"
        tooltip={`Without this talent your main pet would have done 66% more damage than it did as Animal Companion nerfs all pet damage by 40% - however if you're using the azerite trait Pack Alpha, your main pet would have done less damage that way.`}
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

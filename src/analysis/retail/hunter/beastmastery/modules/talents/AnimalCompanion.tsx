import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Your Call Pet additionally summons the first pet from your stable.
 * This pet will obey your Kill Command, but cannot use pet family abilities.
 *
 * Additionally this talent baseline reduces all pet damage by 35%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=damage-done&source=1
 */
class AnimalCompanion extends Analyzer {
  damage = 0;
  pets: Array<{ petName: string; sourceID: number | undefined; damage: number }> = [];
  mainPetName: string = '';

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANIMAL_COMPANION_TALENT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.petDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  petDamage(event: DamageEvent) {
    const foundPet = this.pets.find(
      (pet: { sourceID: number | undefined }) => pet.sourceID === event.sourceID,
    );
    const damage = event.amount + (event.absorbed || 0);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find(
        (pet: { id: number | undefined }) => pet.id === event.sourceID,
      );
      if (!sourcePet || !isPermanentPet(sourcePet.guid)) {
        return;
      }
      this.pets.push({
        petName: sourcePet.name,
        sourceID: event.sourceID,
        damage: damage,
      });
    } else {
      foundPet.damage += damage;
    }
  }

  onFightEnd() {
    let max = 0;
    this.pets.forEach((pet: { damage: number; petName: string }) => {
      if (pet.damage > max) {
        max = pet.damage;
        this.mainPetName = pet.petName;
      }
    });
  }

  statistic() {
    const totalDamage = this.pets
      .map((pet: { damage: number }) => pet.damage)
      .reduce((total: number, current: number) => total + current, 0);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
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
                    <td>
                      {pet.petName === this.mainPetName
                        ? formatNumber(pet.damage / 0.65) +
                          ' / ' +
                          formatNumber(pet.damage / 0.65 / (this.owner.fightDuration / 1000)) +
                          ' DPS'
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ANIMAL_COMPANION_TALENT.id}>
          <>
            {formatNumber(totalDamage)} /{' '}
            {formatNumber(totalDamage / (this.owner.fightDuration / 1000))} DPS
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AnimalCompanion;

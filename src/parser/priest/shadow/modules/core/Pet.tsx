import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

class Pet extends Analyzer {
  _sourceId: number | null = null;
  _pets: any = {};

  constructor(options: Options) {
    super(options);
    this._pets = this.owner.report.friendlyPets.filter((pet: any) => pet.petOwner === this.owner.player.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);

    if (this._pets !== undefined) {
      const pet = this.fetchPet(this._pets);
      if (pet) {
        this._sourceId = pet.id;
      }
    }
  }

  _damageDone: number = 0;

  get damageDone() {
    return this._damageDone;
  }

  get fetchPets() {
    return this._pets;
  }

  onPetDamage(event: DamageEvent) {
    if (this._sourceId !== undefined && event.sourceID === this._sourceId) {
      this._damageDone += event.amount;
    }
  }

  fetchPet(pet: any) {
    return this.fetchPets.find((_pet: any) => _pet.guid === pet.id);
  }
}

export default Pet;

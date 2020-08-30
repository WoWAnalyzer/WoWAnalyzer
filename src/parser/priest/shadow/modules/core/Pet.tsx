import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';

class Pet extends Analyzer {
  _damageDone = 0;
  _sourceId = null;
  _pets: any = {}

  constructor(options: any) {
    super(options);
    this._pets = this.owner.report.friendlyPets.filter((pet: any) => pet.petOwner === this.owner.player.id);

    if (this._pets !== undefined) {
      const pet = this.fetchPet(this._pets);
      if (pet) this._sourceId = pet.id;
    }
  }

  on_damage(event: DamageEvent) {
    if (this._sourceId !== undefined && event.sourceID === this._sourceId) {
      this._damageDone += event.amount;
    }
  }

  get fetchPets() {
    return this._pets;
  }

  get damageDone() {
    return this._damageDone;
  }

  fetchPet(pet: any) {
    return this.fetchPets.find((_pet: any) => _pet.guid === pet.id);
  }
}

export default Pet;

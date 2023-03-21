import { PetInfo } from 'parser/core/Pet';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';

type PetDamageInfo = {
  name: string;
  instances: Record<number, number>;
  total: number;
};

class PetDamage {
  get permanentPetDamage() {
    return Object.keys(this.pets)
      .filter((guid) => isPermanentPet(Number(guid)))
      .map((guid) => this.getDamageForGuid(Number(guid), null))
      .reduce((total, current) => total + current, 0);
  }

  pets: Record<number, PetDamageInfo> = {};

  addDamage(petInfo: PetInfo, instance: number, amount: number) {
    this._ensureFieldExists(petInfo.guid, petInfo.name, instance);
    this.pets[petInfo.guid].instances[instance] += amount;
    this.pets[petInfo.guid].total += amount;
  }

  getDamageForGuid(guid: number, instance: number | null) {
    if (instance === null) {
      return this.pets[guid].total;
    }
    return this.pets[guid].instances[instance];
  }

  _ensureFieldExists(guid: number, name: string, instance: number) {
    this.pets[guid] = this.pets[guid] || { name, instances: {}, total: 0 };
    this.pets[guid].instances[instance] = this.pets[guid].instances[instance] || 0;
  }

  hasEntry(guid: number, instance: number | null) {
    if (instance === null) {
      return Boolean(this.pets[guid]);
    }
    return this.pets[guid] && this.pets[guid].instances[instance] !== undefined;
  }
}

export default PetDamage;

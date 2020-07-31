import { isPermanentPet } from 'parser/shared/modules/pets/helpers';

class PetDamage {
  pets = {
    /*
     [pet guid]: {
        name: string,
        instances: {
          [pet instance]: number
        }
        total: number,
     }
     */
  };

  addDamage(petInfo, instance, amount) {
    this._ensureFieldExists(petInfo.guid, petInfo.name, instance);
    this.pets[petInfo.guid].instances[instance] += amount;
    this.pets[petInfo.guid].total += amount;
  }

  getDamageForGuid(guid, instance) {
    if (instance === null) {
      return this.pets[guid].total;
    }
    return this.pets[guid].instances[instance];
  }

  get permanentPetDamage() {
    return Object.keys(this.pets)
      .filter(guid => isPermanentPet(guid))
      .map(guid => this.getDamageForGuid(guid, null))
      .reduce((total, current) => total + current, 0);
  }

  _ensureFieldExists(guid, name, instance) {
    this.pets[guid] = this.pets[guid] || { name, instances: {}, total: 0};
    this.pets[guid].instances[instance] = this.pets[guid].instances[instance] || 0;
  }

  hasEntry(guid, instance) {
    if (instance === null) {
      return !!this.pets[guid];
    }
    return this.pets[guid] && this.pets[guid].instances[instance] !== undefined;
  }
}

export default PetDamage;

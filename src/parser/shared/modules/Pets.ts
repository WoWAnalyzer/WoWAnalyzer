import { MappedEvent, HasSource, HasTarget } from 'parser/core/Events';
import Pet from 'parser/core/Pet';

import Entities from './Entities';

const debug = false;

class Pets extends Entities<Pet> {
  pets: { [petId: number]: Pet } = {};

  getEntities() {
    return this.pets;
  }

  getSourceEntity(event: MappedEvent) {
    return this.getEntityFromEvent(event, false);
  }

  getEntity(event: MappedEvent) {
    return this.getEntityFromEvent(event, true);
  }

  getEntityFromEvent(event: MappedEvent, fromTarget: boolean): Pet | null {
    let entityId: number;
    if (fromTarget) {
      if (!HasTarget(event) || !event.targetIsFriendly) {
        return null;
      }
      entityId = event.targetID;
    } else {
      if (!HasSource(event) || !event.sourceIsFriendly) {
        return null;
      }
      entityId = event.sourceID;
    }
    let pet = this.pets[entityId];
    if (!pet) {
      const baseInfo = this.owner.playerPets.find((pet) => pet.id === entityId);
      if (!baseInfo) {
        debug && console.warn('Pet not noteworthy enough:', entityId, event);
        return null;
      }
      pet = new Pet(this.owner, baseInfo);
      this.pets[entityId] = pet;
    }
    return pet;
  }
}

export default Pets;

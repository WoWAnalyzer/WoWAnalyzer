import Analyzer from 'parser/core/Analyzer';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import DemoPets from './index';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';

const debug = false;
const test = false;

class WildImpEnergyHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  on_byPlayerPet_cast(event) {
    // handle Wild Imp energy - they should despawn when their energy reaches 0
    if (!this.demoPets.wildImpIds.includes(event.sourceID)) {
      return;
    }
    const pet = this.demoPets._getPetFromTimeline(event.sourceID, event.sourceInstance);
    if (!pet) {
      debug && this.error('Wild Imp from cast event not in timeline!', event);
      return;
    }
    if (pet.realDespawn && event.timestamp >= pet.realDespawn) {
      debug && this.error('Wild Imp casted something after despawn', pet, event);
      return;
    }
    const energyResource = event.classResources && event.classResources.find(resource => resource.type === RESOURCE_TYPES.ENERGY.id);
    if (!energyResource) {
      debug && this.error('Wild Imp doesn\'t have energy class resource field', event);
      return;
    }
    pet.updatePosition(event);
    const oldEnergy = pet.currentEnergy;
    const newEnergy = energyResource.amount - (energyResource.cost || 0); // if Wild Imp is extended by Demonic Tyrant, their casts are essentially free, and the 'cost' field is not present in the event
    pet.currentEnergy = newEnergy;
    if (oldEnergy === pet.currentEnergy) {
      // Imp was empowered at least once, mark as empowered
      pet.setMeta(META_CLASSES.EMPOWERED, META_TOOLTIPS.EMPOWERED);
    }
    pet.pushHistory(event.timestamp, 'Cast', event, 'old energy', oldEnergy, 'new energy', pet.currentEnergy);

    if (pet.currentEnergy === 0) {
      pet.despawn(event.timestamp, DESPAWN_REASONS.ZERO_ENERGY);
      pet.pushHistory(event.timestamp, 'Killed by 0 energy', event);
      test && this.log('Despawning Wild Imp', pet);
    }
  }
}

export default WildImpEnergyHandler;

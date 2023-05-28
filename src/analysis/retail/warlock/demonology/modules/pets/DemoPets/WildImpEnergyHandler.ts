import TALENTS from 'common/TALENTS/warlock';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

import PETS from '../PETS';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';
import DemoPets from './index';

const debug = false;
const test = false;

class WildImpEnergyHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  _wildImpIds: number[] = []; // important for different handling of duration, these IDs change from log to log

  constructor(options: Options) {
    super(options);
    this.demoPets = new DemoPets(options);
    this.initializeWildImps();
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET), this.onPetCast);
  }

  onPetCast(event: CastEvent) {
    // handle Wild Imp energy - they should despawn when their energy reaches 0
    if (!this._wildImpIds.includes(event.sourceID)) {
      return;
    }
    if (!event.sourceInstance) {
      debug && this.error('sourceInstance did not exist on event.', event);
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
    const energyResource =
      event.classResources &&
      event.classResources.find((resource) => resource.type === RESOURCE_TYPES.ENERGY.id);
    if (!energyResource) {
      debug && this.error("Wild Imp doesn't have energy class resource field", event);
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
    pet.pushHistory(event.timestamp, 'Cast', event);

    if (pet.currentEnergy === 0) {
      pet.despawn(event.timestamp, DESPAWN_REASONS.ZERO_ENERGY);
      pet.pushHistory(event.timestamp, 'Killed by 0 energy', event);
      test && this.log('Despawning Wild Imp', pet);
    }
  }

  initializeWildImps() {
    // there's very little possibility these statements wouldn't return an object, Hand of Guldan is a key part of rotation
    const wildImpID = this._toId(PETS.WILD_IMP_HOG.guid);
    wildImpID && this._wildImpIds.push(wildImpID);
    if (this.selectedCombatant.hasTalent(TALENTS.INNER_DEMONS_TALENT)) {
      // and Inner Demons passively summons these Wild Imps
      const innerDemonWildImpID = this._toId(PETS.WILD_IMP_INNER_DEMONS.guid);
      innerDemonWildImpID && this._wildImpIds.push(innerDemonWildImpID);
    }
    // basically player would have to be dead from the beginning to end to not have these recorded
    // (and even then it's probably fine, because it takes the info from parser.playerPets, which is cross-fight)
  }

  _toId(guid: number) {
    return this.demoPets._getPetInfo(guid, true)?.id;
  }
}

export default WildImpEnergyHandler;

import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

import DemoPets from './index';

const debug = false;

class PetDamageHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  onPetDamage(event: DamageEvent) {
    if (!event.sourceID) {
      debug && this.error('Pet damage event with no sourceID', event);
      return;
    }
    if (!event.sourceInstance) {
      debug && this.error('Pet damage event with no sourceInstance', event);
      return;
    }
    const petInfo = this.demoPets._getPetInfo(event.sourceID);
    if (!petInfo) {
      debug && this.error(`Pet damage event with nonexistant pet id ${event.sourceID}`);
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    this.demoPets.damage.addDamage(petInfo, event.sourceInstance, damage);
  }
}

export default PetDamageHandler;

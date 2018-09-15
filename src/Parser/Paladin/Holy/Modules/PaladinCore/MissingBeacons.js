import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import BeaconTargets from './BeaconTargets';
import { BEACON_TRANSFERING_ABILITIES } from '../../Constants';
import BeaconTransferFactor from './BeaconTransferFactor';

class MissingBeacons extends Analyzer {
  static dependencies = {
    beaconTargets: BeaconTargets,
    beaconTransferFactor: BeaconTransferFactor,
    // This also relies on the BeaconOfVirtueNormalizer so precasting FoL into BoV is accounted for properly.
  };

  lostBeaconHealing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const spellBeaconTransferFactor = BEACON_TRANSFERING_ABILITIES[spellId];
    if (!spellBeaconTransferFactor) {
      return;
    }

    const numMissingBeacons = this.beaconTargets.numMaxBeacons - this.beaconTargets.numBeaconsActive;
    if (numMissingBeacons > 0) {
      this.lostBeaconHealing += this.beaconTransferFactor.getExpectedTransfer(event) * numMissingBeacons;
    }
  }
  on_finished() {
    if (this.lostBeaconHealing > 0) {
      console.log('Total beacon healing lost due to missing beacons: up to', this.owner.formatItemHealingDone(this.lostBeaconHealing), '(raw)');
    }
  }
}

export default MissingBeacons;

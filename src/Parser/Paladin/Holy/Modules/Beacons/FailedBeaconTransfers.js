import Analyzer from 'Parser/Core/Analyzer';

import BeaconTransferFactor from './BeaconTransferFactor';

class FailedBeaconTransfers extends Analyzer {
  static dependencies = {
    beaconTransferFactor: BeaconTransferFactor,
  };

  lostBeaconHealing = 0;

  on_byPlayer_beacon_heal_failed(event) {
    this.lostBeaconHealing += this.beaconTransferFactor.getExpectedTransfer(event);
  }
  on_finished() {
    if (this.lostBeaconHealing > 0) {
      this.warn('Total beacon healing lost due to line of sight: up to', this.owner.formatItemHealingDone(this.lostBeaconHealing), '(raw)');
    }
  }
}

export default FailedBeaconTransfers;

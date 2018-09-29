import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import BeaconTransferFactor from './BeaconTransferFactor';
import BeaconHealSource from './BeaconHealSource';

class FailedBeaconTransfers extends Analyzer {
  static dependencies = {
    beaconTransferFactor: BeaconTransferFactor,
    beaconHealSource: BeaconHealSource, // for the events
  };

  lostBeaconHealing = 0;

  on_byPlayer_beacontransferfailed(event) {
    this.lostBeaconHealing += this.beaconTransferFactor.getExpectedTransfer(event);
  }

  statistic() {
    if (this.lostBeaconHealing === 0) {
      // Normally we don't want optional statistics, but this is an exception as this giving any results is very rare.
      return null;
    }

    return (
      <StatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT(0)}
        icon={<SpellIcon id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id} />}
        value={<span style={{ fontSize: '75%' }}>Up to {this.owner.formatItemHealingDone(this.lostBeaconHealing)}</span>}
        label="Beacon healing lost (line of sight)"
        tooltip={'The amount of <b>raw</b> healing that didn\'t transfer to one or more beacon targets due to an issue such as Line of Sight or phasing.'}
      />
    );
  }
}

export default FailedBeaconTransfers;

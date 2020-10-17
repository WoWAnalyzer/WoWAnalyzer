import React from 'react';
import { Trans } from '@lingui/macro';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import BeaconTargets from './BeaconTargets';
import { BEACON_TRANSFERING_ABILITIES } from '../../constants';
import BeaconTransferFactor from './BeaconTransferFactor';
import Events from 'parser/core/Events';

class MissingBeacons extends Analyzer {
  static dependencies = {
    beaconTargets: BeaconTargets,
    beaconTransferFactor: BeaconTransferFactor,
  };

  lostBeaconHealing = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event) {
    const spellId = event.ability.guid;
    const spellBeaconTransferFactor = BEACON_TRANSFERING_ABILITIES[spellId];
    if (!spellBeaconTransferFactor) {
      return;
    }

    const numMissingBeacons =
      this.beaconTargets.numMaxBeacons - this.beaconTargets.numBeaconsActive;
    if (numMissingBeacons > 0) {
      this.lostBeaconHealing +=
        this.beaconTransferFactor.getExpectedTransfer(event) * numMissingBeacons;
    }
  }

  statistic() {
    if (this.lostBeaconHealing === 0) {
      // Normally we don't want optional statistics, but this is an exception as this giving any results is very rare.
      return null;
    }

    const lostBeaconHealing = this.owner.formatItemHealingDone(this.lostBeaconHealing);

    return (
      <StatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT(0)}
        icon={<SpellIcon id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id} />}
        value={
          <span style={{ fontSize: '75%' }}>
            <Trans>Up to {lostBeaconHealing}</Trans>
          </span>
        }
        label={<Trans>Beacon healing lost (missing beacon)</Trans>}
        tooltip={
          <Trans>
            The amount of <strong>raw</strong> healing that didn't transfer to one or more beacon
            targets due to a missing beacon. When a beacon drops, re-apply it quickly.
          </Trans>
        }
      />
    );
  }
}

export default MissingBeacons;

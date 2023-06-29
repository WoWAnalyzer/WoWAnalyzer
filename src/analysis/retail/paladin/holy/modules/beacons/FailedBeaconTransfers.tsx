import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeaconTransferFailedEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import BeaconHealSource from './BeaconHealSource';
import BeaconTransferFactor from './BeaconTransferFactor';

/**
 * @property {BeaconTransferFactor} beaconTransferFactor
 * @property {BeaconHealSource} beaconHealSource
 */
class FailedBeaconTransfers extends Analyzer {
  static dependencies = {
    beaconTransferFactor: BeaconTransferFactor,
    beaconHealSource: BeaconHealSource, // for the events
  };

  protected beaconTransferFactor!: BeaconTransferFactor;
  protected beaconHealSource!: BeaconHealSource;

  lostBeaconHealing = 0;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.BeaconTransferFailed.by(SELECTED_PLAYER),
      this._onBeaconTransferFailed,
    );
  }

  _onBeaconTransferFailed(event: BeaconTransferFailedEvent) {
    this.lostBeaconHealing += this.beaconTransferFactor.getExpectedTransfer(event);
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
        icon={<SpellIcon id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} />}
        value={
          <span style={{ fontSize: '75%' }}>
            <>Up to {lostBeaconHealing}</>
          </span>
        }
        label={<>Beacon healing lost (line of sight)</>}
        tooltip={
          <>
            The amount of <strong>raw</strong> healing that didn't transfer to one or more beacon
            targets due to an issue such as Line of Sight or phasing.
          </>
        }
      />
    );
  }
}

export default FailedBeaconTransfers;

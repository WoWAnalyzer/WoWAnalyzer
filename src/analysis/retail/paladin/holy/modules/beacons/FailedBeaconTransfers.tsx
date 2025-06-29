import { Trans } from '@lingui/react/macro';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeaconTransferFailedEvent } from 'parser/core/Events';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import BeaconHealSource from './BeaconHealSource';
import BeaconTransferFactor from './BeaconTransferFactor';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringValueText from 'parser/ui/BoringValueText';

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

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={
          <>
            <Trans id="paladin.holy.modules.beacons.failedBeaconTransfers.lostBeaconHealingTooltip">
              The amount of <strong>raw</strong> healing that didn't transfer to one or more beacon
              targets due to an issue such as Line of Sight or phasing.
            </Trans>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} /> Beacon healing lost{' '}
              <small>(line of sight)</small>
            </>
          }
        >
          <ItemHealingDone amount={this.lostBeaconHealing} approximate={true} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FailedBeaconTransfers;

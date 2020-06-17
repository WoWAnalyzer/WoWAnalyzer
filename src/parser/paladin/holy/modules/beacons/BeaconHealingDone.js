import React from 'react';
import { Trans } from '@lingui/macro';

import Panel from 'interface/statistics/Panel';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingValue from 'parser/shared/modules/HealingValue';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import BeaconHealSource from './BeaconHealSource';
import BeaconHealingBreakdown from './BeaconHealingBreakdown';

class BeaconHealingDone extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
    healingDone: HealingDone,
  };

  _totalBeaconHealing = new HealingValue();
  _beaconHealingBySource = {};

  constructor(options) {
    super(options);
    this.addEventListener(
      this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER),
      this._onBeaconTransfer,
    );
  }

  _onBeaconTransfer(event) {
    this._totalBeaconHealing = this._totalBeaconHealing.add(
      event.amount,
      event.absorbed,
      event.overheal,
    );

    const source = event.originalHeal;
    const spellId = source.ability.guid;
    let sourceHealing = this._beaconHealingBySource[spellId];
    if (!sourceHealing) {
      sourceHealing = this._beaconHealingBySource[spellId] = {
        ability: source.ability,
        healing: new HealingValue(),
      };
    }
    sourceHealing.healing = sourceHealing.healing.add(event.amount, event.absorbed, event.overheal);
  }

  statistic() {
    return (
      <Panel
        title={<Trans>Beacon healing sources</Trans>}
        explanation={
          <Trans>
            Beacon healing is triggered by the <b>raw</b> healing done of your primary spells. This
            breakdown shows the amount of effective beacon healing replicated by each beacon
            transfering heal.
          </Trans>
        }
        position={120}
        pad={false}
      >
        <BeaconHealingBreakdown
          totalHealingDone={this.healingDone.total}
          totalBeaconHealing={this._totalBeaconHealing}
          beaconHealingBySource={this._beaconHealingBySource}
          fightDuration={this.owner.fightDuration}
        />
      </Panel>
    );
  }
}

export default BeaconHealingDone;

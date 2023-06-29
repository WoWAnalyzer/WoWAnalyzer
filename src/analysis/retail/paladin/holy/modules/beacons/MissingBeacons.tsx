import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { getBeaconSpellFactor } from '../../constants';
import BeaconTargets from './BeaconTargets';
import BeaconTransferFactor from './BeaconTransferFactor';

class MissingBeacons extends Analyzer {
  static dependencies = {
    beaconTargets: BeaconTargets,
    beaconTransferFactor: BeaconTransferFactor,
  };

  protected beaconTargets!: BeaconTargets;
  protected beaconTransferFactor!: BeaconTransferFactor;

  lostBeaconHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const spellBeaconTransferFactor = getBeaconSpellFactor(spellId, this.selectedCombatant);
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
        icon={<SpellIcon id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} />}
        value={
          <span style={{ fontSize: '75%' }}>
            <>Up to {lostBeaconHealing}</>
          </span>
        }
        label={<>Beacon healing lost (missing beacon)</>}
        tooltip={
          <>
            The amount of <strong>raw</strong> healing that didn't transfer to one or more beacon
            targets due to a missing beacon. When a beacon drops, re-apply it quickly.
          </>
        }
      />
    );
  }
}

export default MissingBeacons;

import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { BeaconTransferFailedEvent, HealEvent } from 'parser/core/Events';

import { getBeaconSpellFactor, BEACON_TYPES } from '../../constants';

class BeaconTransferFactor extends Analyzer {
  beaconType = BEACON_TYPES.BEACON_OF_VIRTUE;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT.id)) {
      this.beaconType = BEACON_TYPES.BEACON_OF_FATH;
    }
  }

  getFactor(healEvent: HealEvent | BeaconTransferFailedEvent, beaconHealEvent = null) {
    const spellId = healEvent.ability.guid;
    // base beacon transfer factor
    let beaconFactor = 0.5;

    // Spell specific transfer factor
    const spellFactor = getBeaconSpellFactor(spellId, this.selectedCombatant);
    if (!spellFactor) {
      return 0;
    }
    beaconFactor *= spellFactor;
    // Passive adjustments
    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconFactor *= 0.7;
    }

    return beaconFactor;
  }
  getExpectedTransfer(healEvent: HealEvent | BeaconTransferFailedEvent) {
    // Beacons work off raw healing
    const rawHealing = healEvent.amount + (healEvent.absorbed || 0) + (healEvent.overheal || 0);
    return Math.round(rawHealing * this.getFactor(healEvent));
  }
}

export default BeaconTransferFactor;

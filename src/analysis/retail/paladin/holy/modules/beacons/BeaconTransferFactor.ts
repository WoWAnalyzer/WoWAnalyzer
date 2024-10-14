import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { BeaconTransferFailedEvent, HealEvent } from 'parser/core/Events';

import { getBeaconSpellFactor } from '../../constants';

// 10% of eligible healing is transfered by default
const BEACON_TRANSFER_FACTOR = 0.1;
// Commanding Light talent (1 ranks) can increase beacon transfer up to 20%
const COMMANDING_LIGHT_BONUS_PER_POINT = 0.1;

// Beacon of Faith imposes a 30% penalty on transfer
const BEACON_OF_FAITH_PENALTY = 0.3;

class BeaconTransferFactor extends Analyzer {
  beaconFactor = BEACON_TRANSFER_FACTOR;

  constructor(options: Options) {
    super(options);
    const commandingLightRank = this.selectedCombatant.getTalentRank(
      TALENTS.COMMANDING_LIGHT_TALENT,
    );
    this.beaconFactor += COMMANDING_LIGHT_BONUS_PER_POINT * commandingLightRank;

    // Beacon of Faith penalty has to be applied after Commanding Light bonus
    if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT)) {
      this.beaconFactor *= 1 - BEACON_OF_FAITH_PENALTY;
    }
  }

  getFactor(healEvent: HealEvent | BeaconTransferFailedEvent, beaconHealEvent = null) {
    const spellId = healEvent.ability.guid;

    // Spell specific transfer factor
    const spellFactor = getBeaconSpellFactor(spellId, this.selectedCombatant);
    if (!spellFactor) {
      return 0;
    }

    return this.beaconFactor * spellFactor;
  }
  getExpectedTransfer(healEvent: HealEvent | BeaconTransferFailedEvent) {
    // Beacons work off raw healing
    const rawHealing = healEvent.amount + (healEvent.absorbed || 0) + (healEvent.overheal || 0);
    return Math.round(rawHealing * this.getFactor(healEvent));
  }
}

export default BeaconTransferFactor;

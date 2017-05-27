import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { BEACON_TYPES } from '../../Constants';

const BASE_BEACON_TRANSFER = 0.4;
const LIGHTS_EMBRACE_BEACON_HEAL_INCREASE = 0.4;
const BEACON_OF_FAITH_TRANSFER_REDUCTION = 0.2;

class Tier20_4set extends Module {
  healing = 0;
  totalBeaconHealingDuringLightsEmbrace = 0;

  /** Must have priority over BeaconHealing! */
  priority = 1;
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id);
    }
  }

  lastLightOfDawnHealTimestamp = null;
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }
    // Light of Dawn has weird interactions with buffs triggered by it where the first heal from a cast may not be affected by the buff while subsequent heals are. An example of where this happens is with 4PT20, where the first LoD does NOT gain from the Light's Embrace 40% increased beacon transfer while subsequent heals do.
    // This code checks and marks the event if the heal is the first LoD heal from a cast.
    event.isFirstLodHeal = this.lastLightOfDawnHealTimestamp === null || (event.timestamp - this.lastLightOfDawnHealTimestamp) > 500;
    this.lastLightOfDawnHealTimestamp = event.timestamp;
  }

  on_beacon_heal({ beaconTransferEvent, matchedHeal: healEvent }) {
    const baseBeaconTransferFactor = this.getBaseBeaconTransferFactor(healEvent);
    const lightsEmbraceBeaconTransferFactor = this.getLightsEmbraceBeaconTransferFactor(healEvent);
    if (lightsEmbraceBeaconTransferFactor === 0) {
      return;
    }
    const totalBeaconTransferFactor = baseBeaconTransferFactor + lightsEmbraceBeaconTransferFactor;
    const lightsEmbraceBeaconTransferHealingIncrease = lightsEmbraceBeaconTransferFactor / totalBeaconTransferFactor;

    const effectiveHealing = calculateEffectiveHealing(beaconTransferEvent, lightsEmbraceBeaconTransferHealingIncrease);

    this.healing += effectiveHealing;
    this.totalBeaconHealingDuringLightsEmbrace += beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0) + (beaconTransferEvent.overheal || 0);
  }

  getBaseBeaconTransferFactor(healEvent) {
    let beaconFactor = BASE_BEACON_TRANSFER;

    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }

    return beaconFactor;
  }
  getLightsEmbraceBeaconTransferFactor(healEvent) {
    let beaconTransferFactor = 0;
    // What happens here are 2 situations:
    // - Light of Dawn applies Light's Embrace, it acts a bit weird though since the FIRST heal from the cast does NOT get the increased beacon transfer, while all sebsequent heals do. The first part checks for that. (the Light's Embrace buff will be applied right before the first heal so it would cause a false positive, hence the additional checking).
    // - If a FoL or something else is cast right before the LoD, the beacon transfer may be delayed until after the Light's Embrace is applied. This beacon transfer does not appear to benefit. My hypothesis is that the server does healing and buffs async and there's a small lag between the processes, and I think 50ms should be about the time required.
    const hasLightsEmbrace = (healEvent.ability.guid === SPELLS.LIGHT_OF_DAWN_HEAL.id && !healEvent.isFirstLodHeal) || this.owner.selectedCombatant.hasBuff(SPELLS.LIGHTS_EMBRACE_BUFF.id, null, 0, 100);
    if (hasLightsEmbrace) {
      beaconTransferFactor += LIGHTS_EMBRACE_BEACON_HEAL_INCREASE;
    }
    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconTransferFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }
    // console.log(hasLightsEmbrace, healEvent.ability.name, healEvent, '-', (healEvent.timestamp - this.owner.fight.start_time) / 1000, 'seconds into the fight');

    return beaconTransferFactor;
  }
}

export default Tier20_4set;

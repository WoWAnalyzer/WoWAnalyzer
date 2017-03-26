import Module from 'Main/Parser/Module';
import { BEACON_TRANSFER_SPELL_ID, BEACON_TRANSFERING_ABILITIES, BEACON_TYPES } from 'Main/Parser/Constants';

const debug = false;

class BeaconHealing extends Module {
  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processForBeaconHealing(event);
    }
  }

  beaconTransferEnabledHealsBacklog = [];
  processForBeaconHealing(event) {
    const spellId = event.ability.guid;
    if (spellId === BEACON_TRANSFER_SPELL_ID) {
      this.processBeaconHealing(event);
    }
    const beaconTransferFactor = BEACON_TRANSFERING_ABILITIES[spellId];
    if (!beaconTransferFactor) {
      return;
    }

    const remainingBeaconTransfers = this.beaconType === BEACON_TYPES.BEACON_OF_FATH ? 2 : 1;
    // TODO: Check if the target of this event had a beacon, in that case reduce remainingBeaconTransfers by 1

    this.beaconTransferEnabledHealsBacklog.push({
      ...event,
      beaconTransferFactor,
      remainingBeaconTransfers,
    });
  }
  processBeaconHealing(beaconTransferEvent) {
    // This should make it near impossible to match the wrong spells as we usually don't cast multiple heals within 500ms while the beacon transfer usually happens within 100ms
    this.beaconTransferEnabledHealsBacklog = this.beaconTransferEnabledHealsBacklog.filter(healEvent => (this.owner.currentTimestamp - healEvent.timestamp) < 500);

    const beaconTransferAmount = beaconTransferEvent.amount;
    const beaconTransferAbsorbed = beaconTransferEvent.absorbed || 0;
    const beaconTransferOverheal = beaconTransferEvent.overheal || 0;
    const beaconTransferRaw = beaconTransferAmount + beaconTransferAbsorbed + beaconTransferOverheal;
    const index = this.beaconTransferEnabledHealsBacklog.findIndex((healEvent) => {
      const amount = healEvent.amount;
      const absorbed = healEvent.absorbed || 0;
      const overheal = healEvent.overheal || 0;
      const raw = amount + absorbed + overheal;
      const expectedBeaconTransfer = Math.round(raw * this.beaconTransferFactor * healEvent.beaconTransferFactor);

      return Math.abs(expectedBeaconTransfer - beaconTransferRaw) <= 1; // allow for rounding errors on Blizzard's end
    });

    const hasMatch = index !== -1;
    if (!hasMatch) {
      // Here's a fun fact for you. Fury Warriors with the legendary "Kazzalax, Fujieda's Fury" (http://www.wowhead.com/item=137053/kazzalax-fujiedas-fury)
      // get a 8% healing received increase for almost the entire fight (tooltip states it's 1%, this is a tooltip bug). What's messed up
      // is that this healing increase doesn't beacon transfer. So we won't be able to recognize the heal in here since it's off by 8%, so
      // this will be triggered. While I could implement code to track it, I chose not to because things would get way more complicated and
      // fragile and the accuracy loss for not including this kind of healing is minimal. I expect other healing received increases likely
      // also don't beacon transfer, but right now this isn't common. Fury warrior log:
      // https://www.warcraftlogs.com/reports/TLQ14HfhjRvNrV2y/#view=events&type=healing&source=10&start=7614145&end=7615174&fight=39
      if (debug) {
        console.error('Failed to match', beaconTransferEvent, 'to a heal. Healing backlog:', this.beaconTransferEnabledHealsBacklog);
      }
    } else {
      const matchedHeal = this.beaconTransferEnabledHealsBacklog[index];
      // console.log('Matched beacon transfer', beaconTransferEvent, 'to heal', matchedHeal);
      this.owner.triggerEvent('beacon_heal', {
        beaconTransferEvent,
        matchedHeal,
      });

      matchedHeal.remainingBeaconTransfers -= 1;
      if (matchedHeal.remainingBeaconTransfers < 1) {
        this.beaconTransferEnabledHealsBacklog.splice(index, 1);
      }
    }
  }
  get beaconType() {
    return this.owner.modules.combatants.selected.lv100Talent;
  }
  get beaconTransferFactor() {
    return this.beaconType === BEACON_TYPES.BEACON_OF_FATH ? 0.32 : 0.4;
  }
}

export default BeaconHealing;

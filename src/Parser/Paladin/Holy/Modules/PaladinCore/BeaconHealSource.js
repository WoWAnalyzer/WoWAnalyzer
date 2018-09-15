import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import BeaconTargets from './BeaconTargets';
import { BEACON_TRANSFERING_ABILITIES, BEACON_TYPES } from '../../Constants';

const debug = true;

class BeaconHealSource extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    beaconTargets: BeaconTargets,
    // This also relies on the BeaconOfVirtueNormalizer so precasting FoL into BoV is accounted for properly.
  };

  healBacklog = [];
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      this.processBeaconHealing(event);
      return;
    }
    const spellBeaconTransferFactor = BEACON_TRANSFERING_ABILITIES[spellId];
    if (!spellBeaconTransferFactor) {
      return;
    }

    const beaconTargets = this.beaconTargets;

    let remainingBeaconTransfers = beaconTargets.numBeaconsActive;
    if (beaconTargets.hasBeacon(event.targetID)) {
      remainingBeaconTransfers -= 1;
      debug && this.debug(`${this.combatants.players[event.targetID].name} has beacon, remaining beacon transfers reduced by 1 and is now ${remainingBeaconTransfers}`);
    }

    if (remainingBeaconTransfers > 0) {
      this.healBacklog.push({
        ...event,
        spellBeaconTransferFactor,
        remainingBeaconTransfers,
      });
    }
  }

  processBeaconHealing(beaconTransferEvent) {
    if (debug) {
      this.sanityChecker(beaconTransferEvent);
    }
    // This should make it near impossible to match the wrong spells as we usually don't cast multiple heals within 500ms while the beacon transfer usually happens within 100ms
    // Note: this is REQUIRED to account for line of sighting beacons. LoSed beacons don't transfer, without this filter heals would stay stuck in the queue indefinitely and appoint a lot of beacon healing to the wrong spells. Example log: https://www.warcraftlogs.com/reports/Mc1zG8rytgBHYj2X/#fight=5&source=6
    // This may lead to an issue where sometimes the beacon replication of LoD self-heals can be delayed by a long time and don't properly assign source, but this should be much rarer. (see commit db5dd9a7b8eb3b935abd4d617b400c27abdd7b61)
    let removals = 0;
    this.healBacklog.forEach((healEvent, index) => {
      const age = this.owner.currentTimestamp - healEvent.timestamp;
      if (age > 500) {
        this.error('No beacon transfer found for heal:', healEvent);
        this.healBacklog.splice(index - removals, 1);
        removals += 1; // adjust for the index shifting after removals (can't use filter since we need to report this to the console)
      }
    });

    const index = this._matchByOrder(beaconTransferEvent);
    const matchedHeal = this.healBacklog[index];
    if (!matchedHeal) {
      this.error('No heal found for beacon transfer:', beaconTransferEvent);
      return;
    }

    // Fabricate a new event to make it easy to listen to just beacon heal events while being away of the original heals. While we could also modify the original heal event and add a reference to the original heal, this would be less clean as mutating objects makes things harder and more confusing to use, and may lead to conflicts.
    this.owner.fabricateEvent({
      ...beaconTransferEvent,
      type: 'beacon_heal',
      originalHeal: matchedHeal,
    }, beaconTransferEvent);

    matchedHeal.remainingBeaconTransfers -= 1;
    if (matchedHeal.remainingBeaconTransfers < 1) {
      this.healBacklog.splice(index, 1);
    }
  }

  get beaconType() {
    return this.selectedCombatant.lv100Talent;
  }
  /**
   * Verify that the beacon transfer matches what we would expect. This isn't 100% reliable due to weird interactions with stuff like Blood Death Knights (Vampiric Blood and probably other things), and other healing received increasers.
   */
  sanityChecker(beaconTransferEvent) {
    const beaconTransferAmount = beaconTransferEvent.amount;
    const beaconTransferAbsorbed = beaconTransferEvent.absorbed || 0;
    const beaconTransferOverheal = beaconTransferEvent.overheal || 0;
    const beaconTransferRaw = beaconTransferAmount + beaconTransferAbsorbed + beaconTransferOverheal;
    const index = this._matchByHealSize(beaconTransferEvent);

    if (index === -1) {
      // Here's a fun fact for you. Fury Warriors with the legendary "Kazzalax, Fujieda's Fury" (http://www.wowhead.com/item=137053/kazzalax-fujiedas-fury)
      // get a 8% healing received increase for almost the entire fight (tooltip states it's 1%, this is a tooltip bug). What's messed up
      // is that this healing increase doesn't beacon transfer. So we won't be able to recognize the heal in here since it's off by 8%, so
      // this will be triggered. While I could implement code to track it, I chose not to because things would get way more complicated and
      // fragile and the accuracy loss for not including this kind of healing is minimal. I expect other healing received increases likely
      // also don't beacon transfer, but right now this isn't common. Fury warrior log:
      // https://www.warcraftlogs.com/reports/TLQ14HfhjRvNrV2y/#view=events&type=healing&source=10&start=7614145&end=7615174&fight=39
      this.error('Failed to match', beaconTransferEvent, 'to a heal at all. Backlog:');
      this._dumpBacklog(beaconTransferEvent, beaconTransferRaw);
    } else if (index !== 0) {
      const matchedHeal = this.healBacklog[index];
      this.warn('Matched', beaconTransferEvent, 'to', matchedHeal, `but it wasn't the first heal in the Backlog (it was #${index}). Something is likely wrong. Backlog:`);
      this._dumpBacklog(beaconTransferEvent, beaconTransferRaw);
    }
  }
  _dumpBacklog(beaconTransferEvent, beaconTransferRaw) {
    this.healBacklog.forEach((healEvent, i) => {
      const expectedBeaconTransfer = this.getExpectedBeaconTransfer(healEvent, beaconTransferEvent);

      this.debug(i, {
        ability: healEvent.ability.name,
        healEvent,
        raw: healEvent.amount + (healEvent.absorbed || 0) + (healEvent.overheal || 0),
        expectedBeaconTransfer,
        actual: beaconTransferRaw,
        difference: Math.abs(expectedBeaconTransfer - beaconTransferRaw),
        beaconTransferFactor: this.getBeaconTransferFactor(healEvent),
        spellBeaconTransferFactor: healEvent.spellBeaconTransferFactor,
      });
    });
  }
  /**
   * @returns {number} Gets the next heal in the backlog without any extra checks. This usually works since beacon healing is ordered in the combat log right after the heal that triggered it, and, while there's a delay before the beacon transfer happens, it's extremely rare for there to be multiple heals happening within short time spans - short enough to be before the beacon transfer.
   * It does sometimes happen though, such as with Light of Dawn heals as well as Azerite Powers that apply hots and beacon transfer.
   * @private
   */
  _matchByOrder(beaconTransferEvent) {
    return 0;
  }
  /**
   * @returns {number} Gets the next heal in the backlog that matches the expected source heal amount through simply reversing the transfer formula.
   */
  _matchByHealSize(beaconTransferEvent) {
    const rawBeaconTransfer = beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0) + (beaconTransferEvent.overheal || 0);

    return this.healBacklog.findIndex(healEvent => {
      const expectedBeaconTransfer = this.getExpectedBeaconTransfer(healEvent, beaconTransferEvent);

      return Math.abs(expectedBeaconTransfer - rawBeaconTransfer) <= 2; // allow for rounding errors on Blizzard's end
    });
  }

  getBeaconTransferFactor(healEvent) {
    let beaconFactor = 0.4;
    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconFactor *= 0.7;
    }

    return beaconFactor;
  }
  getExpectedBeaconTransfer(healEvent, beaconTransferEvent) {
    const amount = healEvent.amount;
    const absorbed = healEvent.absorbed || 0;
    const overheal = healEvent.overheal || 0;
    let raw = amount + absorbed + overheal;

    const healTargetId = healEvent.targetID;
    const healCombatant = this.combatants.players[healTargetId];
    if (healCombatant) {
      if (healCombatant.hasBuff(SPELLS.VAMPIRIC_BLOOD.id, healEvent.timestamp)) {
        raw /= 1.3;
      }
    }

    let expectedBeaconTransfer = Math.round(raw * this.getBeaconTransferFactor(healEvent) * healEvent.spellBeaconTransferFactor);

    const beaconTargetId = beaconTransferEvent.targetID;
    const beaconCombatant = this.combatants.players[beaconTargetId];
    if (beaconCombatant) {
      if (beaconCombatant.hasBuff(SPELLS.VAMPIRIC_BLOOD.id, healEvent.timestamp)) {
        expectedBeaconTransfer *= 1.3;
      }
    }

    return expectedBeaconTransfer;
  }
}

export default BeaconHealSource;

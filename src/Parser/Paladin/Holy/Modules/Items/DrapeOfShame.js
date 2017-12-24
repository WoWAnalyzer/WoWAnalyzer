import SPELLS from 'common/SPELLS';

import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import CoreDrapeOfShame, { DRAPE_OF_SHAME_CRIT_EFFECT } from 'Parser/Core/Modules/Items/DrapeOfShame';

class DrapeOfShame extends CoreDrapeOfShame {
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 || spellId === SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL.id) {
      return;
    }
    super.on_byPlayer_heal(event);
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    const spellId = healEvent.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 || spellId === SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL.id) {
      return;
    }
    if (healEvent.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(healEvent);
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
}

export default DrapeOfShame;

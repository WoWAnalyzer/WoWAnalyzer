import SPELLS from 'common/SPELLS';
import CoreMightOfTheMountain, { CRIT_EFFECT } from 'Parser/Core/Modules/Racials/Dwarf/MightOfTheMountain';

import BeaconHealOriginMatcher from '../../PaladinCore/BeaconHealOriginMatcher';

class MightOfTheMountain extends CoreMightOfTheMountain {
  static dependencies = {
    ...CoreMightOfTheMountain.dependencies,
    // We use its "beacon_heal" event
    beaconHealOriginMatcher: BeaconHealOriginMatcher,
  };

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }
    super.on_byPlayer_heal(event);
  }
  on_beacon_heal(event) {
    if (!this.isApplicableHeal(event.originalHeal)) {
      return;
    }
    const spellId = event.originalHeal.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event.originalHeal);
    const rawDrapeHealing = rawNormalPart * CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
}

export default MightOfTheMountain;

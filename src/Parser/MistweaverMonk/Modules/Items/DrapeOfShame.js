import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

export const DRAPE_OF_SHAME_CRIT_EFFECT = 0.05;

class DrapeOfShame extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBack(ITEMS.DRAPE_OF_SHAME.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.getCritHealingBonus(event);
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing);

    this.healing += effectiveHealing;
  }
  getCritHealingBonus(event) {
    let critModifier = 2;
    critModifier += DRAPE_OF_SHAME_CRIT_EFFECT;
    return critModifier;
  }
}

export default DrapeOfShame;

import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, HIT_TYPES, TRAITS, BEACON_TRANSFER_SPELL_ID, HOLY_SHOCK_SPELL_ID } from 'Main/Parser/Constants';

export const DRAPE_OF_SHAME_ITEM_ID = 142170;
export const DRAPE_OF_SHAME_CRIT_EFFECT = 0.1;

class DrapeOfShame extends Module {
  healing = 0;

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processForDrapeOfShameHealing(event);
    }
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal }) {
    this.processBeaconHealingForDrapeOfShameHealing(beaconTransferEvent, matchedHeal);
  }
  processForDrapeOfShameHealing(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1 || spellId === BEACON_TRANSFER_SPELL_ID) {
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

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
  processBeaconHealingForDrapeOfShameHealing(beaconTransferEvent, healEvent) {
    const spellId = healEvent.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1 || spellId === BEACON_TRANSFER_SPELL_ID) {
      return;
    }
    if (healEvent.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.getCritHealingBonus(healEvent);
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
  getCritHealingBonus(event) {
    let critModifier = 2;
    if (this.owner.modules.combatants.selected.hasBack(DRAPE_OF_SHAME_ITEM_ID)) {
      critModifier += DRAPE_OF_SHAME_CRIT_EFFECT;
    }
    if (event.ability.guid === HOLY_SHOCK_SPELL_ID) {
      const shockTreatmentTraits = this.owner.modules.combatants.selected.traitsBySpellId[TRAITS.SHOCK_TREATMENT];
      // Shock Treatment increases critical healing of Holy Shock by 8%: http://www.wowhead.com/spell=200315/shock-treatment
      // This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
      critModifier += shockTreatmentTraits * 0.08 * 2;
    }
    return critModifier;
  }
}

export default DrapeOfShame;

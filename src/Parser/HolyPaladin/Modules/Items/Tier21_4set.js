import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

const BASE_HEALING_MODIFIER = 1.0;
const CRIT_HEALING_MODIFIER_INCREASE = 1.0;
const PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE = 1.0;
const PURITY_OF_LIGHT_AFFECTED_HEALS = [
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.HOLY_LIGHT.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
];

class Tier21_4set extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T21_4SET_BONUS_BUFF.id);
  }

  lastLightOfDawnHealTimestamp = null;
  on_byPlayer_heal(event) {
    if (!this.isApplicable(event)) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / (BASE_HEALING_MODIFIER + CRIT_HEALING_MODIFIER_INCREASE + PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE);
    const rawDrapeHealing = rawNormalPart * PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal: healEvent }) {
    if (!this.isApplicable(healEvent)) {
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / (BASE_HEALING_MODIFIER + CRIT_HEALING_MODIFIER_INCREASE + PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE);
    const rawDrapeHealing = rawNormalPart * PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  isApplicable(event) {
    const spellId = event.ability.guid;
    if (PURITY_OF_LIGHT_AFFECTED_HEALS.indexOf(spellId) === -1) {
      return false;
    }
    if (!this.owner.selectedCombatant.hasBuff(SPELLS.PURITY_OF_LIGHT.id, event.timestamp)) {
      return false;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return false;
    }
    return true;
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PALADIN_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PALADIN_T21_4SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default Tier21_4set;

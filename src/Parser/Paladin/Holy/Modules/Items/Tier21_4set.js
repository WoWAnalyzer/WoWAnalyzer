import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const BASE_HEALING_PERCENTAGE = 1.0;
const PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE = 1.0;
const PURITY_OF_LIGHT_AFFECTED_HEALS = [
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.HOLY_LIGHT.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
];

/**
 * 4 pieces (Holy) : Holy Shock has a 30% chance to increase the critical healing of your Flash of Light, Holy Light, and Light of Dawn by 100% for 10 sec.
 */
class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T21_4SET_BONUS_BUFF.id);

    if (this.active) {
      this.critEffectBonus.hook(this.getCritEffectBonus.bind(this));
    }
  }

  getCritEffectBonus(critEffectModifier, event) {
    if (this.isApplicable(event)) {
      // Purity of Light (Tier 21 4 set) is multiplicative of the crit effect modifier, so with it Drape of Shame's increase becomes 10%. It is known.
      critEffectModifier = (critEffectModifier - BASE_HEALING_PERCENTAGE) * (1 + PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE) + BASE_HEALING_PERCENTAGE;
      // The above formula in layman's terms:
      // base = 100%
      // existingCritMod = 200% (205% with DoS)
      // 4setBonus = 100%
      // newCritEffectModifier = (existingCritMod - base) * (100% + 4setBonus) + base
      // so: newCritEffectModifier = (existingCritMod - 100%) * 200% + 100%
      // Verified by comparing crit FoLs with regular FoLs.
    }
    return critEffectModifier;
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
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event);
    const rawDrapeHealing = rawNormalPart * PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (!this.isApplicable(healEvent)) {
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(healEvent);
    const rawDrapeHealing = rawNormalPart * PURITY_OF_LIGHT_CRITICAL_HEALING_INCREASE;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  isApplicable(event) {
    const spellId = event.ability.guid;
    if (PURITY_OF_LIGHT_AFFECTED_HEALS.indexOf(spellId) === -1) {
      return false;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.PURITY_OF_LIGHT.id, event.timestamp)) {
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
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default Tier21_4set;

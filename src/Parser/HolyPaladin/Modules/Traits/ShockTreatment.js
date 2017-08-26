import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

// This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
const SHOCK_TREATMENT_CRIT_EFFECT = 0.08 * 2;

/**
 * Shock Treatment (Artifact Trait)
 * Increases critical strike damage and critical healing of Holy Shock by 8%.
 */
class ShockTreatment extends Module {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.owner.selectedCombatant.traitsBySpellId[SPELLS.SHOCK_TREATMENT.id];
    this.active = this.rank > 0;

    if (this.active) {
      this.critEffectBonus.hook(this.getCritEffectBonus.bind(this));
    }
  }

  getCritEffectBonus(critEffectModifier, event) {
    if (event.ability.guid === SPELLS.HOLY_SHOCK_HEAL.id) {
      critEffectModifier += this.rank * SHOCK_TREATMENT_CRIT_EFFECT * 2;
    }
    return critEffectModifier;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.HOLY_SHOCK_HEAL.id || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event);
    const rawDrapeHealing = rawNormalPart * SHOCK_TREATMENT_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.HOLY_SHOCK_HEAL.id || healEvent.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(healEvent);
    const rawDrapeHealing = rawNormalPart * SHOCK_TREATMENT_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHOCK_TREATMENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
        label="Shock Treatment healing"
        tooltip={`This only calculates the value of the last Shock Treatment point (you have a total of ${this.rank} points), for you with your gear and only during this fight. The value of an additional point would be slightly lower.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.TRAITS(1);
}

export default ShockTreatment;

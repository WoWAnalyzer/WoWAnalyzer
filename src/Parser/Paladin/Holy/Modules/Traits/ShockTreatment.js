import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import Combatants from 'Parser/Core/Modules/Combatants';

// This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
const SHOCK_TREATMENT_CRIT_EFFECT = 0.08 * 2;

/**
 * Shock Treatment (Artifact Trait)
 * Increases critical strike damage and critical healing of Holy Shock by 8%.
 */
class ShockTreatment extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
  };

  rank = 0;
  healing = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SHOCK_TREATMENT.id];
    this.active = this.rank > 0;

    if (this.active) {
      this.critEffectBonus.hook(this.getCritEffectBonus.bind(this));
    }
  }

  getCritEffectBonus(critEffectModifier, event) {
    if (event.ability.guid === SPELLS.HOLY_SHOCK_HEAL.id) {
      critEffectModifier += this.rank * SHOCK_TREATMENT_CRIT_EFFECT;
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
  on_beacon_heal(event) {
    if (event.originalHeal.ability.guid !== SPELLS.HOLY_SHOCK_HEAL.id || event.originalHeal.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event.originalHeal);
    const rawDrapeHealing = rawNormalPart * SHOCK_TREATMENT_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SHOCK_TREATMENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default ShockTreatment;

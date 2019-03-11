import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import StatValues from 'parser/monk/mistweaver/modules/features/StatValues';


const secretInfusionStat = traits => Object.values(traits).reduce((obj, rank) => {
  const stat = calculateAzeriteEffects(SPELLS.SECRET_INFUSION.id, rank);
  obj.stat += Number(stat);
  return obj;
}, {
  stat: 0,
});

class SecretInfusion extends Analyzer {
  /**
   * After using Thunder Focus Tea, your next spell gives X of a stat for 10 sec:
   * Enveloping Mist: Critical strike - Buff ID: 287835
   * Renewing Mist: Haste - Buff ID: 287831
   * Vivify: Mastery - Buff ID: 287836
   * Rising Sun Kick: Versatility - Buff ID: 287837
   */
  static dependencies = {
    statTracker: StatTracker,
    statValues: StatValues,
  };

  statModifier = 0;
  healingCritBuff = 0;
  healingMasteryBuff = 0;
  healingHasteBuff = 0;
  healingVersatilityBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SECRET_INFUSION.id);
    if (!this.active) {
      return;
    }
    const { stat } = secretInfusionStat(this.selectedCombatant.traitsBySpellId[SPELLS.SECRET_INFUSION.id]);
    this.statModifier = stat;

    this.statTracker.add(SPELLS.SECRET_INFUSION_MASTERY.id, {
      mastery: this.statModifier,
    });
    this.statTracker.add(SPELLS.SECRET_INFUSION_CRIT.id, {
     crit: this.statModifier,
    });
    this.statTracker.add(SPELLS.SECRET_INFUSION_VERSATILITY.id, {
      versatility: this.statModifier,
    });
    this.statTracker.add(SPELLS.SECRET_INFUSION_HASTE.id, {
      haste: this.statModifier,
    });
  }

  on_byPlayer_heal(event) {
    const overheal = event.overheal || 0;
    const absorbed = event.absorbed || 0;
    const effectiveHealing = (event.amount + absorbed) - overheal;

    if (overheal > 0) {
      return;
    }

    this.healingCritBuff += this.selectedCombatant.hasBuff(SPELLS.SECRET_INFUSION_CRIT.id) ? effectiveHealing : 0;
    this.healingHasteBuff += this.selectedCombatant.hasBuff(SPELLS.SECRET_INFUSION_HASTE.id) ? effectiveHealing : 0;
    this.healingMasteryBuff += this.selectedCombatant.hasBuff(SPELLS.SECRET_INFUSION_VERSATILITY.id) ? effectiveHealing : 0;
    this.healingVersatilityBuff += this.selectedCombatant.hasBuff(SPELLS.SECRET_INFUSION_MASTERY.id) ? effectiveHealing : 0;
  }

  get buffUptimeCrit() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SECRET_INFUSION_CRIT.id) / this.owner.fightDuration;
  }
  get buffUptimeHaste() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SECRET_INFUSION_HASTE.id) / this.owner.fightDuration;
  }
  get buffUptimeMastery() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SECRET_INFUSION_MASTERY.id) / this.owner.fightDuration;
  }
  get buffUptimeVersatility() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SECRET_INFUSION_VERSATILITY.id) / this.owner.fightDuration;
  }

  averageStatModifier(buffUptime) {
    return buffUptime * this.statModifier;
  }

  get totalBuffUptime() {
    return this.buffUptimeCrit + this.buffUptimeMastery + this.buffUptimeHaste + this.buffUptimeVersatility;
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.SECRET_INFUSION.id}
        value={(
          <>
            {formatNumber(this.averageStatModifier(this.buffUptimeMastery))} Average Mastery Rating<br />
            {formatNumber(this.averageStatModifier(this.buffUptimeCrit))} Average Crit Rating<br />
            {formatNumber(this.averageStatModifier(this.buffUptimeHaste))} Average Haste Rating<br />
            {formatNumber(this.averageStatModifier(this.buffUptimeVersatility))} Average Versatility Rating<br />
          </>
        )}
        tooltip={(
          <>
            Grants <b>{this.statModifier}</b> additional stats when Thunder Focus Tea is used.<br />
            Buff Uptime: {formatPercentage(this.totalBuffUptime)}%
          </>
        )}
      />
    );
  }

}

export default SecretInfusion;

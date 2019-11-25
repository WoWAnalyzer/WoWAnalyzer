import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;

class CombustionCharges extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  lowPhoenixFlamesCharges = 0;
  lowFireBlastCharges = 0;
  lastCastEvent = null;
  badCast = false;

  constructor(...args) {
    super(...args);
    this.hasPhoenixFlames = this.selectedCombatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id);
    this.hasFlameOn = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
  }

  //When Combustion is cast, check to see how many charges of Fire Blast and Phoenix Flames are available. If there is less than (Max Charges - 1) then its a bad Combustion cast. 
  onCombustion(event) {
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const phoenixFlamesCharges = (this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES_TALENT.id) || 0);
    this.badCast = false;
    this.lastCastEvent = event;

    if (this.hasFlameOn && fireBlastCharges < 2) {
      this.lowFireBlastCharges += 1;
      this.badCast = true;
      debug && this.log("Fire Blast Charges: " + fireBlastCharges);
      debug && this.log("Low Fire Blast Charges");
    } else if (!this.hasFlameOn && fireBlastCharges < 1) {
      this.lowFireBlastCharges += 1;
      this.badCast = true;
      debug && this.log("Fire Blast Charges: " + fireBlastCharges);
      debug && this.log("Low Fire Blast Charges");
    }

    if (this.hasPhoenixFlames && phoenixFlamesCharges < 2) {
      this.lowPhoenixFlamesCharges += 1;
      this.badCast = true;
      debug && this.log("Phoenix Flames Charges: " + phoenixFlamesCharges);
      debug && this.log("Low Phoenix Flames Charges");
    }

    if (this.badCast) {
      this.flagTimeline();
    }
  }

  flagTimeline() {
    this.lastCastEvent.meta = this.lastCastEvent.meta || {};
    this.lastCastEvent.meta.isInefficientCast = true;
    this.lastCastEvent.meta.inefficientCastReason = `This Combustion was cast with a low amount of Fire Blast ${this.hasPhoenixFlames ? 'and/or Phoenix Flames' : '' }charges. In order to get the most out of your Combustion casts, ensure that you have at least ${this.hasFlameOn ? '2' : '1' } Fire Blast charges${this.hasPhoenixFlames ? ' and 2 Phoenix Flames charges' : '' }. `;
  }

  get phoenixFlamesChargeUtil() {
    return 1 - (this.lowPhoenixFlamesCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get fireBlastChargeUtil() {
    return 1 - (this.lowFireBlastCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get phoenixFlamesThresholds() {
    return {
      actual: this.phoenixFlamesChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: 'percentage',
    };
  }

  get fireBlastThresholds() {
    return {
      actual: this.fireBlastChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.hasPhoenixFlames) {
      when(this.phoenixFlamesThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowPhoenixFlamesCharges} times with less than 2 charges of <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} />. Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
    }
    when(this.fireBlastThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowFireBlastCharges} times with less than {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges of <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.fireBlastChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
  }
}
export default CombustionCharges;

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';
import AbilityTracker from 'parser/core/modules/AbilityTracker';

const debug = false;

class CombustionCharges extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  lowPhoenixFlamesCharges = 0;
  lowFireBlastCharges = 0;

  constructor(...args) {
    super(...args);
    this.hasPhoenixFlames = this.selectedCombatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id);
    this.hasFlameOn = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id);
  }

  //When Combustion is cast, check to see how many charges of Phoenix Flames and Fire Blast were available.
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    debug && this.log("Fire Blast Charges: " + fireBlastCharges);
    if (this.hasFlameOn && fireBlastCharges < 2) {
      this.lowFireBlastCharges += 1;
      debug && this.log("Low Fire Blast Charges");
    } else if (fireBlastCharges < 1) {
      this.lowFireBlastCharges += 1;
      debug && this.log("Low Fire Blast Charges");
    }

    if (this.hasPhoenixFlames) {
      const phoenixFlamesCharges = this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES_TALENT.id);
      debug && this.log("Phoenix Flames Charges: " + phoenixFlamesCharges);
      if (phoenixFlamesCharges < 2) {
        this.lowPhoenixFlamesCharges += 1;
        debug && this.log("Low Phoenix Flames Charges");
      }
    }
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
        return suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowFireBlastCharges} times with less than {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} charges of <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.fireBlastChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
  }
}
export default CombustionCharges;

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatMilliseconds, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const debug = false;

class CombustionCharges extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  lowPhoenixFlamesCharges = 0;
  lowFireBlastCharges = 0;

  //When Combustion is cast, check to see how many charges of Phoenix Flames and Fire Blast were available.
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COMBUSTION.id) {
      return;
    }
    const phoenixFlamesCharges = this.spellUsable.chargesAvailable(SPELLS.PHOENIXS_FLAMES.id);
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    debug && console.log("Phoenix Flames Charges: " + phoenixFlamesCharges + " - " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    debug && console.log("Fire Blast Charges: " + fireBlastCharges + " - " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    if (phoenixFlamesCharges < 2) {
      this.lowPhoenixFlamesCharges += 1;
      debug && console.log("Low Phoenix Flames Charges @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
    if (this.combatants.selected.hasTalent(SPELLS.FLAME_ON_TALENT.id) && fireBlastCharges < 2) {
      this.lowFireBlastCharges += 1;
      debug && console.log("Low Fire Blast Charges @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else if (fireBlastCharges < 1) {
      this.lowFireBlastCharges += 1;
      debug && console.log("Low Fire Blast Charges @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
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
    when(this.phoenixFlamesThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.COMBUSTION.id}/> {this.lowPhoenixFlamesCharges} times with less than 2 charges of <SpellLink id={SPELLS.PHOENIXS_FLAMES.id}/>. Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id}/> procs as possible before Combustion ends.</React.Fragment>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
    when(this.fireBlastThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.COMBUSTION.id}/> {this.lowFireBlastCharges} times with less than {this.combatants.selected.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} charges of <SpellLink id={SPELLS.FIRE_BLAST.id}/>. Make sure you are saving at least {this.combatants.selected.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 2 : 1} charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id}/> procs as possible before Combustion ends.</React.Fragment>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.fireBlastChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
  }
}
export default CombustionCharges;

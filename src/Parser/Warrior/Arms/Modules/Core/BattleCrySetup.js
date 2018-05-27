import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Combatants from 'Parser/Core/Modules/Combatants';

import BattleCryAnalyzer from './BattleCry';

/**
 * Analyzer for buff/cooldown setup for Battle Cries.
 * @extends BattleCryAnalyzer
 */
class BattleCrySetupAnalyzer extends BattleCryAnalyzer {
  static dependencies = {
    combatants: Combatants,
  };

  shatteredSetups = 0;

  startBattleCry(event) {
    const shatteredSetup = this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id);

    if(shatteredSetup) {
      this.shatteredSetups += 1;
    } else {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This Battle Cry was used without Shattered Defenses active.';
    }
  }

  /** Returns a suggestion threshold for Shattered Defenses being setup for Battle Cry. */
  get shatteredSetupThresholds() {
    return {
			actual: this.shatteredSetups / this.battleCryCount,
			isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
			style: 'percentage',
		};
  }

  suggestions(when) {
    when(this.shatteredSetupThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to have <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon /> active before you use <SpellLink id={SPELLS.BATTLE_CRY.id} icon /> to maximize your burst potential.</React.Fragment>)
        .icon(SPELLS.SHATTERED_DEFENSES.icon)
        .actual(`Shattered Defenses was up for ${formatPercentage(actual)}% of Battle Cries.`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default BattleCrySetupAnalyzer;

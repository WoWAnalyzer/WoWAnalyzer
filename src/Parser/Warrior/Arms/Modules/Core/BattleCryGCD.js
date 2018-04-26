import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

import BattleCryAnalyzer from './BattleCry';

const GLOBAL_COOLDOWN = 1500;

/**
 * Analyzer for GCD usage during Battle Cries.
 * @extends BattleCryAnalyzer
 */
class BattleCryGCDAnalyzer extends BattleCryAnalyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  battleCries = [];
  currentBattleCry;

  startBattleCry(event) {
    this.currentBattleCry = {
      gcdsUsed: 0,
      activeTime: 0,
    };
    this.battleCries.push(this.currentBattleCry);
  }

  battleCryCast(event) {
    // If a spell on global cooldown was cast during Battle Cry, record it.
    if(this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      this.currentBattleCry.gcdsUsed += 1;
      this.currentBattleCry.activeTime += this.globalCooldown.getCurrentGlobalCooldown(event.ability.guid);
    }
  }

  /** Returns the amount of GCDs used during Battle Cries. */
  get gcdsUsed() {
    let gcdsUsed = 0;
    this.battleCries.forEach(battleCry => {
      gcdsUsed += battleCry.gcdsUsed;
    });

    return gcdsUsed;
  }

  /**
  * Returns the amount of GCDs wasted during Battle Cry.
  * This is calculated using base GCD, so it may report less wasted if the user is inactive for close to base GCD during a Battle Cry.
  */
  get gcdsWasted() {
    let gcdsWasted = 0;
    this.battleCries.forEach(battleCry => {
      let wastedTime = BattleCryAnalyzer.BATTLE_CRY_DURATION - battleCry.activeTime;
      while(wastedTime > 0) {
        wastedTime -= GLOBAL_COOLDOWN;
        gcdsWasted += 1;
      }
    });

    return gcdsWasted;
  }

  /** Returns a suggestion threshold for maximizing GCD use during Battle Cry. */
  get gcdThresholds() {
    return {
			actual: this.gcdsWasted,
			isGreaterThan: {
        minor: 0,
        average: Math.ceil(this.battleCries.length / 4),
        major: 2 * Math.ceil(this.battleCries.length / 4),
      },
			style: 'number',
		};
  }

  suggestions(when) {
    when(this.gcdThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to use every GCD available during <SpellLink id={SPELLS.BATTLE_CRY.id} icon/>. Damage dealt during <SpellLink id={SPELLS.BATTLE_CRY.id} icon/> comprises a large portion of total damage done, so maximizing ability use during the buff window is critical.</React.Fragment>)
        .icon(SPELLS.BATTLE_CRY.icon)
        .actual(`You missed ${actual} GCDs across ${this.battleCries.length} Battle Cries.`)
        .recommended(`${recommended} is recommended`);
    });
  }
}

export default BattleCryGCDAnalyzer;

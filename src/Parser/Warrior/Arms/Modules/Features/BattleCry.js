import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

const SHATTERED_DEFENSES_ICON = 'warrior_talent_icon_igniteweapon';

/**
 * Handles the analysis of a player's Battle Cry usage.
 * @extends Analyzer
 */
class BattleCryAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  battleCrying = false;
  battleCries = [];
  currentBattleCry;

  on_byPlayer_applybuff(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      // If Battle Cry was applied create a new Battle Cry recording.
      this.battleCrying = true;
      this.currentBattleCry = new BattleCry();

      this.currentBattleCry.shatteredSetup = this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id);
    }
  }

  on_byPlayer_removebuff(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      this.battleCrying = false;
      this.battleCries.push(this.currentBattleCry);
      // The current Battle Cry isn't removed here as it will be needed to track Corrupted Blood of Zakajz outside of the buff window.
    }
  }

  /** Returns a suggestion threshold for Shattered Defenses being setup for Battle Cry */
  get shatteredSetupThresholds() {

    // Get the number of Battle Cries setup with Shattered Defenses.
    let shatteredSetups = 0;
    this.battleCries.forEach(battleCry => {
      if(battleCry.shatteredSetup) {
        shatteredSetups += 1;
      }
    });

    return {
			actual: shatteredSetups / this.battleCries.length,
			isLessThan: {minor: 0.95, average: 0.9, major: 0.85},
			style: 'percentage',
		};
  }

  suggestions(when) {
    when(this.shatteredSetupThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should ensure <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon/> is up before you use <SpellLink id={SPELLS.BATTLE_CRY.id} icon/> to maximize your burst potential.</Wrapper>)
          .icon(SHATTERED_DEFENSES_ICON)
          .actual(`Shattered Defenses was up for ${formatPercentage(actual)}% of Battle Cries.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }
}

/** Class containing information regarding a single use of Battle Cry */
class BattleCry {
  _shatteredSetup = false;

  get shatteredSetup() {
    return this._shatteredSetup;
  }

  set shatteredSetup(shatteredSetup) {
    this._shatteredSetup = shatteredSetup;
  }
}

export default BattleCryAnalyzer;

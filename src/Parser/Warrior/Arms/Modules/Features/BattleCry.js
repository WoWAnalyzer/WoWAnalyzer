import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageDone from 'Parser/Core/Modules/DamageDone';

/**
 * Handles the analysis of a player's Battle Cry usage.
 * @extends Analyzer
 */
class BattleCryAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    damageDone: DamageDone,
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

  on_byPlayer_damage(event) {
    // If damage is dealt during Battle Cry, or if damage is dealt by Corrupted Blood of Zakajz, add it to the current Battle Cry.
    if (!event.targetIsFriendly && (this.battleCrying || SPELLS.CORRUPTED_BLOOD_OF_ZAKAJZ.id === event.ability.guid)) {
      this.currentBattleCry.addDamage(event.amount + event.absorbed);
    }
  }

  /** Returns the percentage of Battle Cries that had Shattered Defenses setup. */
  get shatteredSetupPercent() {
    let shatteredSetups = 0;
    this.battleCries.forEach(battleCry => {
      if(battleCry.shatteredSetup) {
        shatteredSetups += 1;
      }
    });

    return shatteredSetups / this.battleCries.length;
  }

  /** Returns a suggestion threshold for Shattered Defenses being setup for Battle Cry. */
  get shatteredSetupThresholds() {
    return {
			actual: this.shatteredSetupPercent,
			isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85},
			style: 'percentage',
		};
  }

  /** Returns the damage dealt during or as a result of Battle Cry. */
  get battleCryDamage() {
    let battleCryDamage = 0;
    this.battleCries.forEach(battleCry => {
      battleCryDamage += battleCry.getDamage();
    });

    return battleCryDamage;
  }

  suggestions(when) {
    when(this.shatteredSetupThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should ensure <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon/> is active before you use <SpellLink id={SPELLS.BATTLE_CRY.id} icon/> to maximize your burst potential.</Wrapper>)
          .icon(SPELLS.SHATTERED_DEFENSES.icon)
          .actual(`Shattered Defenses was up for ${formatPercentage(actual)}% of Battle Cries.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const battleCryDamage = this.battleCryDamage;
    const totalDamage = this.damageDone.total.effective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BATTLE_CRY.id} />}
        value={`${formatNumber(battleCryDamage / this.battleCries.length)}`}
        label="Average damage during Battle Cry"
        tooltip={`Damage dealt during Battle Cry contributed ${formatPercentage(battleCryDamage / totalDamage)}% of your total damage done.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

/** Class containing information regarding a single use of Battle Cry */
class BattleCry {
  /** @type {boolean} Whether Shattered Defenses was up before Battle Cry was used. */
  _shatteredSetup = false;

  /** @type {number} The amount of damage dealt during or as a result of Battle Cry. */
  damage = 0;

  get shatteredSetup() {
    return this._shatteredSetup;
  }

  set shatteredSetup(shatteredSetup) {
    this._shatteredSetup = shatteredSetup;
  }

  getDamage() {
    return this.damage;
  }

  addDamage(damage) {
    this.damage += damage;
  }
}

export default BattleCryAnalyzer;

import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

const BATTLE_CRY_DURATION = 5000;
const GLOBAL_COOLDOWn = 1500;

/**
 * Handles the analysis of a player's Battle Cry usage.
 * @extends Analyzer
 */
class BattleCryAnalyzer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    damageDone: DamageDone,
    globalCooldown: GlobalCooldown,
  };

  battleCrying = false;
  battleCries = [];
  currentBattleCry;

  on_byPlayer_cast(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      // If Battle Cry was cast create a new Battle Cry recording.
      this.battleCrying = true;
      this.currentBattleCry = new BattleCry();

      this.currentBattleCry.shatteredSetup = this.combatants.selected.hasBuff(SPELLS.SHATTERED_DEFENSES.id);

      if(!this.currentBattleCry.shatteredSetup) {
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = 'This Battle Cry was used without Shattered Defenses active.';
      }

      return;
    }

    if(!this.battleCrying) {
      // Ignore any other casts if we aren't Battle Crying.
      return;
    }

    if(this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      this.currentBattleCry.addGcdUse(this.globalCooldown.getCurrentGlobalCooldown(event.ability.guid));
    }
  }

  on_byPlayer_damage(event) {
    // If damage is dealt during Battle Cry, or if damage is dealt by Corrupted Blood of Zakajz, add it to the current Battle Cry.
    if (!event.targetIsFriendly && (this.battleCrying || SPELLS.CORRUPTED_BLOOD_OF_ZAKAJZ.id === event.ability.guid)) {
      this.currentBattleCry.addDamage(event.amount + event.absorbed);
    }
  }

  on_byPlayer_removebuff(event) {
    if(SPELLS.BATTLE_CRY.id === event.ability.guid) {
      this.battleCrying = false;
      this.battleCries.push(this.currentBattleCry);
      // The current Battle Cry isn't removed here as it will be needed to track Corrupted Blood of Zakajz outside of the buff window.
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

  /** Returns the amount of GCDs used during Battle Cries. */
  get gcdsUsed() {
    let gcdsUsed = 0;
    this.battleCries.forEach(battleCry => {
      gcdsUsed += battleCry.getGcdsUsed();
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
      let wastedTime = BATTLE_CRY_DURATION - battleCry.getActiveTime();
      while(wastedTime > 0) {
        wastedTime -= GLOBAL_COOLDOWn;
        gcdsWasted += 1;
      }
    });

    return gcdsWasted;
  }

  /** Returns a suggestion threshold for Shattered Defenses being setup for Battle Cry. */
  get shatteredSetupThresholds() {
    return {
			actual: this.shatteredSetupPercent,
			isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
			style: 'percentage',
		};
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
        return suggest(<React.Fragment>Try to have <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon/> active before you use <SpellLink id={SPELLS.BATTLE_CRY.id} icon/> to maximize your burst potential.</React.Fragment>)
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

  /** @type {number} The amount of time spent active during Battle Cry (in MS). */
  activeTime = 0;

  /** @type {number} The amount of GCDs used during Battle Cry. */
  gcdsUsed = 0;

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

  getActiveTime() {
    return this.activeTime;
  }

  getGcdsUsed() {
    return this.gcdsUsed;
  }

  addGcdUse(gcdTime) {
    this.activeTime += gcdTime;
    this.gcdsUsed += 1;
  }
}

export default BattleCryAnalyzer;

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../Core/SharedBrews';

const debug = false;
const FACE_PALM_AP_RATIO = 1.281;
const TIGER_PALM_REDUCTION = 1000;
const FACE_PALM_REDUCTION = 1000;

class TigerPalm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boc: BlackoutCombo,
    brews: SharedBrews,
    statTracker: StatTracker,
  };

  totalCasts = 0;
  normalHits = 0;
  bocHits = 0;
  fpHits = 0;
  bocFpHits = 0;
  lastAttackPower = 0;

  cdr = 0;
  wastedCDR = 0;
  fpCDR = 0;
  wastedFpCDR = 0;

  bocBuffActive = false;
  bocApplyToTP = false;

  get facePalmHits() {
    return this.fpHits + this.bocFpHits;
  }

  get totalBocHits() {
    return this.bocHits + this.bocFpHits;
  }

  get bocEmpoweredThreshold() {
    if(!this.combatants.selected.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id)) {
      return null;
    } 
    return {
      actual: this.totalBocHits / this.totalCasts,
      isLessThan: {
        minor: 0.095,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TIGER_PALM.id === spellId) {
      this.totalCasts += 1;
      this.bocApplyToTP = this.bocBuffActive;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TIGER_PALM.id === spellId) {
      // OK SO we have a hit, lets reduce the CD by the base amount...
      const actualReduction = this.brews.reduceCooldown(TIGER_PALM_REDUCTION);
      this.cdr += actualReduction;
      this.wastedCDR += TIGER_PALM_REDUCTION - actualReduction;

      if (this._facePalmProc(event)) {
        // BUT this is also FACE PALM so we reduce it by an extra amount
        // too!
        const actualFpReduction = this.brews.reduceCooldown(FACE_PALM_REDUCTION);
        this.fpCDR += actualFpReduction;
        this.wastedFpCDR += FACE_PALM_REDUCTION - actualFpReduction;
        if (this.bocApplyToTP) {
          this.bocFpHits += 1;
        } else {
          this.fpHits += 1;
        }
      } else {
        if (this.bocApplyToTP) {
          this.bocHits += 1;
        } else {
          this.normalHits += 1;
        }
      }
    }
  }

  on_toPlayer_damage(event) {
    // record the last known AP to estimate the amount of damage a
    // non-FP TP should do
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }

  // predicate function returning `true` if we think this is an FP proc,
  // `false` otherwise
  // 
  // we're going to do this by using halfway between non-fp/fp as a
  // cutoff. anything >= the cut-off is FP, and anything < the cut-off
  // is non-FP
  _facePalmProc(event) {
    let normalDamage = this.lastAttackPower * FACE_PALM_AP_RATIO * (1.0 + this.statTracker.currentVersatilityPercentage);
    if (this.bocApplyToTP) {
      normalDamage *= 3;
    }
    const critDamage = normalDamage * 2;
    const fpNormalDamage = normalDamage * 3;
    const fpCritDamage = critDamage * 3;

    const normalCutoff = (fpNormalDamage + normalDamage) / 2.0;
    const critCutoff = (fpCritDamage + critDamage) / 2.0;

    debug && console.log(`FP detection (crit: ${event.hitType === HIT_TYPES.CRIT}): normal ${normalCutoff}, crit ${critCutoff}, actual ${event.amount}`);
    if (event.hitType === HIT_TYPES.CRIT) {
      // crit
      debug && console.log(`FP prediction (crit): non-FP ${critDamage}, FP ${fpCritDamage}, actual ${event.amount}`);
      return event.amount >= critCutoff;
    } else if (event.hitType === HIT_TYPES.NORMAL) {
      // non-crit
      debug && console.log(`FP prediction (normal): non-FP ${normalDamage}, FP ${fpNormalDamage}, actual ${event.amount}`);
      return event.amount >= normalCutoff;
    }
    console.warn(`unknown hitType ${event.hitType} seen for Tiger Palm`);
    return false;
  }
}

export default TigerPalm;

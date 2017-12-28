import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import BlackoutCombo from './BlackoutCombo';

const debug = false;
const FACE_PALM_AP_RATIO = 1.281;
class TigerPalm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boc: BlackoutCombo,
  }

  totalCasts = 0;
  normalHits = 0;
  bocHits = 0;
  fpHits = 0;
  bocFpHits = 0;
  lastAttackPower = 0;

  boc_buff_active = false;
  boc_apply_to_tp = false;

  get facePalmHits() {
    return this.fpHits + this.bocFpHits;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff_active = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff_active = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff_active = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(SPELLS.TIGER_PALM.id === spellId) {
      this.totalCasts += 1;
      this.boc_apply_to_tp = this.boc_buff_active;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(SPELLS.TIGER_PALM.id === spellId) {
      if(this._face_palm_proc(event)) {
        if(this.boc_apply_to_tp) {
          this.bocFpHits += 1;
        } else {
          this.fpHits += 1;
        }
      } else {
        if(this.boc_apply_to_tp) {
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
    if (event.hasOwnProperty("attackPower") && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }

  // predicate function returning `true` if we think this is an FP proc,
  // `false` otherwise
  // 
  // we're going to do this by using halfway between non-fp/fp as a
  // cutoff. anything >= the cut-off is FP, and anything < the cut-off
  // is non-FP
  _face_palm_proc(event) {
    let normalDamage = this.lastAttackPower * FACE_PALM_AP_RATIO * (1.0 + this.combatants.selected.versatilityPercentage);
    if(this.boc_apply_to_tp) {
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

import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { BOC_DURATION } from '../Spells/BlackoutCombo';

const TIGER_PALM_REDUCTION = 1000;
const FACE_PALM_REDUCTION = 1000;
const KEG_SMASH_REDUCTION = 4000;
const BOC_KEG_SMASH_REDUCTION = 6000;
const WRISTS_REDUCTION = 1000;
const FACE_PALM_AP_RATIO = 1.281;
const debug = false;

class BrewCDR extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  wristsEquipped = false;

  // total amount of time removed from brew cds
  totalCDR = 0;
  // used for determining if a TP procced FP or not
  lastAttackPower = 0;
  tpCasts = 0;
  fpProcs = 0;
  ksCasts = 0;
  ksHits = 0;
  dodgedHits = 0;

  // the state-tracking for the BlackoutCombo module doesn't play nicely
  // with double-reads, so we're tracking the state again
  //
  // this is major code smell
  boc_buff = false;
  boc_apply_to = 0;

  on_initialized() {
    this.wristsEquipped = this.combatants.selected.hasWrists(ITEMS.ANVIL_HARDENED_WRISTWRAPS.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.boc_buff = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(SPELLS.KEG_SMASH.id === spellId) {
      this.ksCasts += 1;
    } else if(SPELLS.TIGER_PALM.id === spellId) {
      this.tpCasts += 1;
    }

    if(SPELLS.KEG_SMASH.id === spellId || SPELLS.TIGER_PALM.id === spellId) {
      // determine whether *each hit* of this Keg Smash uses
      // KEG_SMASH_REDUCTION or BOC_KEG_SMASH_REDUCTION. 
      //
      // this is done here because a) due to travel time the buff may
      // wear off before the damage hits, and b) the damage may go off
      // multiple times due to traits, and if boc is up for the cast
      // then *all* get the additional reduction
      if (this.boc_buff) {
        this.boc_apply_to = spellId;
      } else {
        this.boc_apply_to = 0; // don't apply it to any CDR from this ability
      }
    }
  }

  on_toPlayer_damage(event) {
    // record the last known AP to estimate the amount of damage a
    // non-FP TP should do
    if (event.hasOwnProperty("attackPower") && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
    if (this.wristsEquipped && event.hitType === HIT_TYPES.DODGE) {
      this.totalCDR += WRISTS_REDUCTION;
      this.dodgedHits += 1;
    } 
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(SPELLS.KEG_SMASH.id === spellId) {
      this.ksHits += 1;
      if(this.boc_apply_to === spellId) {
        this.totalCDR += BOC_KEG_SMASH_REDUCTION;
      } else {
        this.totalCDR += KEG_SMASH_REDUCTION;
      }
    } else if (SPELLS.TIGER_PALM.id === spellId) {
      // there is no buff or additional hit for Face Palm, so we try to
      // classify it based on the damage a regular hit should do.
      if (this._face_palm_proc(event)) {
        this.fpProcs += 1;
        this.totalCDR += TIGER_PALM_REDUCTION + FACE_PALM_REDUCTION;
      } else {
        this.totalCDR += TIGER_PALM_REDUCTION;
      }
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
    if(this.boc_apply_to === SPELLS.TIGER_PALM.id) {
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

  statistic() {
    let wristsDesc = "";
    if(this.wristsEquipped) {
      wristsDesc = `and ${this.dodgedHits} dodged attacks `;
    }
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${this.totalCDR / 1000}s`}
        label="Total brew cooldown reduction"
        tooltip={`${this.ksHits} Keg Smash hits (${this.ksHits / this.ksCasts} per cast) and ${this.tpCasts} Tiger Palm hits (with ${this.fpProcs} Face Palm procs -- a rate of ${formatPercentage(this.fpProcs / this.tpCasts)}) ${wristsDesc}reduced your brew cooldowns by ${this.totalCDR / 1000}s.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;

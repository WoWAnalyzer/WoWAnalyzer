import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';
import { EVENT_STAGGER_POOL_ADDED, EVENT_STAGGER_POOL_REMOVED } from '../core/StaggerFabricator';
import AgilityValue, { staggerPct } from './AgilityValue';
import { lookupK } from '../constants/Mitigation';

const debug = true;

export function hotTrubDamage(amtPurified, maxHP) {
  return Math.min(uncappedHotTrubDamage(amtPurified), Math.floor(maxHP * 0.2));
}

export function uncappedHotTrubDamage(amtPurified) {
  return Math.floor(amtPurified * 0.2);
}

function pctLost(obj) {
  return obj.lost / (obj.lost + obj.damage);
}

export default class HotTrubValue extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    agi: AgilityValue,
  };

  actual = null;

  degenerate = null;

  K = null;

  constructor(...props) {
    super(...props);

    this.K = lookupK(this.owner.fight);

    this.actual = {
      damage: 0,
      maxCast: 0,
      lost: 0,
    };

    this.degenerate = {
      damage: 0,
      maxCast: 0,
      lost: 0,
      staggerPool: 0,
      tickAmount: 0,
    };

    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._calculatePurifyDamage);
    
    this.addEventListener(EVENT_STAGGER_POOL_ADDED, this._degenerateStaggerAdd);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PURIFYING_BREW, SPELLS.IRONSKIN_BREW]), this._degeneratePurifyDamage);
    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._degenerateRemoveStagger);
  }

  _calculatePurifyDamage(event) {
    if(event._reason.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }

    const dmg = hotTrubDamage(event.amount, event._reason.maxHitPoints);
    this.actual.damage += dmg;
    this.actual.lost += uncappedHotTrubDamage(event.amount) - dmg;

    if(dmg > this.actual.maxCast) {
      this.actual.maxCast = dmg;
    }
  }

  _degenerateStaggerAdd(event) {
    const actualPct = staggerPct(
      this.stats.currentAgilityRating, this.K, 
      this.selectedCombatant.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id),
      this.agi.hasHT
    );

    const degenPct = staggerPct(
      this.stats.currentAgilityRating, this.K, 
      false,
      this.agi.hasHT
    );

    const staggered = event.amount * degenPct / actualPct;
    this.degenerate.staggerPool += staggered;

    const numTicks = this.selectedCombatant.hasTalent(SPELLS.BOB_AND_WEAVE_TALENT.id) ? 26 : 20;
    this.degenerate.tickAmount = Math.ceil(this.degenerate.staggerPool / numTicks);
    debug && this.log("Degenerate staggered damage", staggered, "Total Stagger", this.degenerate.staggerPool);
  }

  _degeneratePurifyDamage(event) {
    const amount = this.degenerate.staggerPool / 2;
    this.degenerate.staggerPool -= amount;
    this.degenerate.tickAmount /= 2;

    const dmg = hotTrubDamage(amount, event.maxHitPoints);
    this.degenerate.damage += dmg;
    this.degenerate.lost += uncappedHotTrubDamage(amount) - dmg;

    if(dmg > this.degenerate.maxCast) {
      this.degenerate.maxCast = dmg;
    }
    debug && this.log("Degenerate purified", amount, "Damage dealt", dmg, "Remaining Stagger", this.degenerate.staggerPool);
  }

  _degenerateRemoveStagger(event) {
    if(event._reason.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // handled in _degeneratePurifyDamage, everything else is flat
      // reduction
      return;
    }

    if(event._reason.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      // stagger dot, replace event amount with our own tick amount;
      this.degenerate.staggerPool -= this.degenerate.tickAmount;
      return;
    }
    
    const amount = event.amount + event.overheal;
    this.degenerate.staggerPool -= Math.min(this.degenerate.staggerPool, amount);
  }
  
  statistic() {
    return (
      <StatisticBox
        label="Hot Trub Time Machine"
        icon={<SpellIcon id={SPELLS.HOT_TRUB.id} />}
        value={<ItemDamageDone amount={this.actual.damage} />}
      >
        <div style={{padding: '2ex'}}>
          <dl>
            <dt><b>Max Cast</b></dt> <dd>{formatNumber(this.actual.maxCast)}</dd>
            <dt><b>Damage Lost to HP Cap</b></dt> <dd>{formatNumber(this.actual.lost)} <em>({formatPercentage(pctLost(this.actual))}%)</em></dd>
          </dl>
          <br />
          <p>These numbers are all <em>hypothetical</em>. You don't need to have the Conflict &amp; Strife essence equipped to see this.</p>
          <h5>Degenerate Play</h5>
          <p>If you replaced every ISB cast with a PB cast, how much damage would you have done?</p>
          <dl>
            <dt><b>Total Damage</b></dt>
            <dd><ItemDamageDone amount={this.degenerate.damage} /></dd>
            <dt><b>Max Cast</b></dt>
            <dd>{formatNumber(this.degenerate.maxCast)}</dd>
            <dt><b>Damage Lost to HP Cap</b></dt>
            <dd>{formatNumber(this.degenerate.lost)} <em>({formatPercentage(pctLost(this.degenerate))}%)</em></dd>
          </dl>
        </div>
      </StatisticBox>
    );
  }
}

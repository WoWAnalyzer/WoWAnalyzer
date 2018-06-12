import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import StatisticsListBox from 'Main/StatisticsListBox';

const debug = false;

/**
 * Feral has a snapshotting mechanic which means the effect of some buffs are maintained over the duration of
 * some DoTs even after the buff has worn off.
 * Players should follow a number of rules with regards when they refresh a DoT and when they do not, depending
 * on what buffs the DoT has snapshot and what buffs are currently active.
 * 
 * The Snapshot class is 'abstract', and shouldn't be directly instantiated. Instead classes should extend
 * it to examine how well the combatant is making use of the snapshot mechanic.
 */

// also applied by Incarnation: King of the Jungle, and Shadowmeld
const PROWL_MULTIPLIER = 2.00;
const TIGERS_FURY_MULTIPLIER = 1.15;
const BLOODTALONS_MULTIPLIER = 1.20;

// "[...]deal the same damage as normal but in 20% less time."
const JAGGED_WOUNDS_MODIFIER = 0.80;

const PANDEMIC_FRACTION = 0.3;

/**
 * leeway in ms after loss of bloodtalons/prowl buff to count a cast as being buffed.
 * Danger of false positives from buffs fading due to causes other than being used to buff a DoT.
 */
const BUFF_WINDOW_TIME = 60;

// leeway in ms between a cast event and debuff apply/refresh for them to be associated
const CAST_WINDOW_TIME = 100;

/**
 * Leeway in ms between when a debuff was expected to wear off and when damage events will no longer be counted
 * Largest found in logs is 149ms:
 * https://www.warcraftlogs.com/reports/8Ddyzh9nRjrxv3JA/#fight=16&source=21
 * Moonfire DoT tick at 8:13.300, expected to expire at 8:13.151
 */
const DAMAGE_AFTER_EXPIRE_WINDOW = 200;

class Snapshot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // extending class should fill these in:
  static spellCastId = null;
  static debuffId = null;
  static isProwlAffected = false;
  static isTigersFuryAffected = false;
  static isBloodtalonsAffected = false;
  static durationOfFresh = null;

  stateByTarget = {};
  lastDoTCastEvent;

  castCount = 0;
  ticks = 0;
  ticksWithProwl = 0;
  ticksWithTigersFury = 0;
  ticksWithBloodtalons = 0;
  damageFromProwl = 0;
  damageFromTigersFury = 0;
  damageFromBloodtalons = 0;

  on_byPlayer_cast(event) {
    if (this.constructor.spellCastId !== event.ability.guid) {
      return;
    }
    this.castCount += 1;
    this.lastDoTCastEvent = event;
  }

  on_initialized() {
    if (!this.constructor.spellCastId || !this.constructor.debuffId) {
      this.active = false;
      throw new Error('Snapshot should be extended and provided with spellCastId and debuffId.');
    }
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly || this.constructor.debuffId !== event.ability.guid || !event.tick) {
      // ignore damage on friendlies, damage not from the tracked DoT, and any non-DoT damage
      return;
    }
    const damage = (event.amount || 0) + (event.absorbed || 0);
    if (damage === 0) {
      // what buffs a zero-damage tick has doesn't matter, so don't count them (usually means target is currently immune to damage)
      return;
    }
    const state = this.stateByTarget[encodeTargetString(event.targetID, event.targetInstance)];
    if (!state || event.timestamp > state.expireTime + DAMAGE_AFTER_EXPIRE_WINDOW) {
      debug && console.warn(`At ${this.owner.formatTimestamp(event.timestamp, 3)} damage detected from DoT ${this.constructor.debuffId} but no active state recorded for the target. Previous state expired: ${state ? this.owner.formatTimestamp(state.expireTime, 3) : 'n/a'}`);
      return;
    }

    this.ticks += 1;
    if (state.prowl) {
      this.ticksWithProwl += 1;
      this.damageFromProwl += damage * (1 - 1 / PROWL_MULTIPLIER);
    }
    if (state.tigersFury) {
      this.ticksWithTigersFury += 1;
      this.damageFromTigersFury += damage * (1 - 1 / TIGERS_FURY_MULTIPLIER);
    }
    if (state.bloodtalons) {
      this.ticksWithBloodtalons += 1;
      this.damageFromBloodtalons += damage * (1 - 1 / BLOODTALONS_MULTIPLIER);
    }
  }

  on_byPlayer_applydebuff(event) {
    if (this.constructor.debuffId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  on_byPlayer_refreshdebuff(event) {
    if (this.constructor.debuffId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  dotApplied(event) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const stateOld = this.stateByTarget[targetString];
    const stateNew = this.makeNewState(event, stateOld);
    this.stateByTarget[targetString] = stateNew;

    debug && console.log(`DoT ${this.constructor.debuffId} applied at ${this.owner.formatTimestamp(event.timestamp, 3)} Prowl:${stateNew.prowl}, TF: ${stateNew.tigersFury}, BT: ${stateNew.bloodtalons}. Expires at ${this.owner.formatTimestamp(stateNew.expireTime, 3)}`);

    this.checkRefreshRule(stateNew);
  }

  makeNewState(debuffEvent, stateOld) {
    const timeRemainOnOld = stateOld ? (stateOld.expireTime - debuffEvent.timestamp) : 0;
    let expireNew = debuffEvent.timestamp + this.constructor.durationOfFresh;
    if (timeRemainOnOld > 0) {
      expireNew += Math.min(this.constructor.durationOfFresh * PANDEMIC_FRACTION, timeRemainOnOld);
    }

    const combatant = this.combatants.selected;
    const stateNew = {
      expireTime: expireNew,
      pandemicTime: expireNew - this.constructor.durationOfFresh * PANDEMIC_FRACTION,
      tigersFury: this.constructor.isTigersFuryAffected &&
        combatant.hasBuff(SPELLS.TIGERS_FURY.id),
      prowl: this.constructor.isProwlAffected && (
        combatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) ||
        combatant.hasBuff(SPELLS.PROWL.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.PROWL_INCARNATION.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.SHADOWMELD.id, null, BUFF_WINDOW_TIME)
      ),
      bloodtalons: this.constructor.isBloodtalonsAffected &&
        combatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, null, BUFF_WINDOW_TIME),
      power: 1,
      startTime: debuffEvent.timestamp,
      castEvent: this.lastDoTCastEvent,
      
      // undefined if the first application of this debuff on this target
      prev: stateOld,
    };
    stateNew.power = this.calcPower(stateNew);

    if (!stateNew.castEvent ||
        stateNew.startTime > stateNew.castEvent.timestamp + CAST_WINDOW_TIME ) {
      debug && console.warn(`DoT ${this.constructor.debuffId} applied debuff at ${this.owner.formatTimestamp(debuffEvent.timestamp, 3)} doesn't have a recent matching cast event.`);
    }
    
    return stateNew;
  }

  calcPower(stateNew) {
    let power = 1.0;
    if (stateNew.prowl) {
      power *= PROWL_MULTIPLIER;
    }
    if (stateNew.tigersFury) {
      power *= TIGERS_FURY_MULTIPLIER;
    }
    if (stateNew.bloodtalons) {
      power *= BLOODTALONS_MULTIPLIER;
    }
    return power;
  }

  checkRefreshRule(state) {
    debug && console.warn('Expected checkRefreshRule function to be overridden.');
  }

  subStatistic(ticksWithBuff, damageIncrease, buffId, buffName, spellName) {
    const info = (
      // subStatistics for this DoT will be combined, so each should have a unique key
      <div className="flex" key={buffId}>
        <div className="flex-main">
        <SpellLink id={buffId} />
        </div>
        <div className="flex-sub text-right">
        <dfn data-tip={`${formatNumber(damageIncrease / this.owner.fightDuration * 1000)} DPS contributed by ${buffName} on your ${spellName} DoT`}>
          {formatPercentage(this.ticks === 0 ? 0 : ticksWithBuff / this.ticks)}%
        </dfn>
        </div>
      </div>
    );
    return info;
  }

  generateStatistic(spellName) {
    const subStats = [];
    const buffNames = [];
    if (this.constructor.isProwlAffected) {
      const buffName = 'Prowl';
      buffNames.push(buffName);
      subStats.push(this.subStatistic(this.ticksWithProwl, this.damageFromProwl, SPELLS.PROWL.id, buffName, spellName));
    }
    if (this.constructor.isTigersFuryAffected) {
      const buffName = 'Tiger\'s Fury';
      buffNames.push(buffName);
      subStats.push(this.subStatistic(this.ticksWithTigersFury, this.damageFromTigersFury, SPELLS.TIGERS_FURY.id, buffName, spellName));
    }
    if (this.constructor.isBloodtalonsAffected && this.combatants.selected.hasTalent(SPELLS.BLOODTALONS_TALENT.id)) {
      const buffName = 'Bloodtalons';
      buffNames.push(buffName);
      subStats.push(this.subStatistic(this.ticksWithBloodtalons, this.damageFromBloodtalons, SPELLS.BLOODTALONS_TALENT.id, buffName, spellName));
    }
    let buffsComment = '';
    buffNames.forEach((name, index) => {
      const hasComma = (buffNames.length > 2 && index < buffNames.length - 1);
      const hasAnd = (index === buffNames.length - 2);
      buffsComment = `${buffsComment}${name}${hasComma ? ', ' : ''}${hasAnd ? ' and ' : ''}`;
    });
    const isPlural = buffNames.length > 1;
    return (
      <StatisticsListBox
        title={
          <React.Fragment>
            <SpellIcon id={this.constructor.spellCastId} noLink /> {spellName} Snapshot
          </React.Fragment>
        }
        tooltip={`${spellName} maintains the damage bonus from ${buffsComment} if ${isPlural ? 'they were' : 'it was'} present when the DoT was applied. This lists how many of your ${spellName} ticks benefited from ${isPlural ? 'each' : 'the'} buff. ${isPlural ? 'As a tick can benefit from multiple buffs at once these percentages can add up to more than 100%.' : ''}`}
      >
        {subStats}
      </StatisticsListBox>
    );
  }
}
export default Snapshot;
export { JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION };

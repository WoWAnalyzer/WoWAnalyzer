import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

const PANDEMIC_FRACTION = 0.3;

const NIGHTSTALKER_MULTIPLIER = 1.5;
const SUBTERFUGE_MULTIPLIER = 1.8;

/**
 * When you cannot refresh a snapshotted DoT with another snaphshotted one, ideally you'd let it tick down.
 * Then at the moment that it expires you'd apply a fresh DoT.
 * But exact timing is unrealistic, so give some leeway.
 */
const FORGIVE_LOST_TIME = 500;

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

/**
 * Assassination has a snapshotting mechanic which means the effect of some buffs are maintained over the duration of
 * some DoTs even after the buff has worn off.
 * Players should follow a number of rules with regards when they refresh a DoT and when they do not, depending
 * on what buffs the DoT has snapshot and what buffs are currently active.
 *
 * The Snapshot class is 'abstract', and shouldn't be directly instantiated. Instead classes should extend
 * it to examine how well the combatant is making use of the snapshot mechanic.
 */
class Snapshot extends Analyzer {
  // extending class should fill these in:
  static spellCastId = null;
  static debuffId = null;
  static spellIcon = null;

  stateByTarget = {};
  lastDoTCastEvent;

  talentName = '';
  multiplier = 1;
  bonusDamage = 0;
  lostSnapshotTime = 0;
  snapshotTime = 0;

  onFightend() {
    debug && console.log('lost: ' + this.lostSnapshotTime / 1000 + ', total: ' + this.snapshotTime / 1000 + ', bonus damage: ' + this.bonusDamage.toFixed(0));
  }

  onCast(event) {
    if (this.constructor.spellCastId !== event.ability.guid) {
      return;
    }
    this.lastDoTCastEvent = event;
  }

  constructor(...args) {
    super(...args);
    if (!this.constructor.spellCastId || !this.constructor.debuffId) {
      this.active = false;
      throw new Error('Snapshot should be extended and provided with spellCastId, debuffId and spellIcon.');
    }
    if (this.selectedCombatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id)) {
      this.talentName = 'Nightstalker';
      this.multiplier = NIGHTSTALKER_MULTIPLIER;
    } else if (this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)) {
      this.talentName = 'Subterfuge';
      this.multiplier = SUBTERFUGE_MULTIPLIER;
    } else {
      this.active = false;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER), this.onRefreshDebuff);

    this.addEventListener(Events.fightend, this.onFightend);

  }

  onDamage(event) {
    if (this.constructor.debuffId !== event.ability.guid) {
      return;
    }
    if ((event.amount || 0) + (event.absorbed || 0) === 0) {
      // what buffs a zero-damage tick has doesn't matter, so don't count them (usually means target is currently immune to damage)
      return;
    }
    const state = this.stateByTarget[encodeTargetString(event.targetID, event.targetInstance)];
    if (!state || event.timestamp > state.expireTime + DAMAGE_AFTER_EXPIRE_WINDOW) {
      debug && console.warn(`At ${this.owner.formatTimestamp(event.timestamp, 3)} damage detected from DoT ${this.constructor.debuffId} but no active state recorded for the target. Previous state expired: ${state ? this.owner.formatTimestamp(state.expireTime, 3) : 'n/a'}`);
      return;
    }

    if (state.buffed) {
      this.bonusDamage += calculateEffectiveDamage(event, this.multiplier - 1);
    }
  }

  onRemoveDebuff(event) {
    if (this.constructor.debuffId !== event.ability.guid) {
      return;
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const stateOld = this.stateByTarget[targetString];
    stateOld.expireTime = event.timestamp;
    if (stateOld.buffed) {
      this.snapshotTime += stateOld.expireTime - stateOld.startTime;
    }
  }

  onApplyDebuff(event) {
    if (this.constructor.debuffId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  onRefreshDebuff(event) {
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

    debug && console.log(`DoT ${this.constructor.debuffId} applied at ${this.owner.formatTimestamp(event.timestamp, 3)} Buffed:${stateNew.buffed}. Expires at ${this.owner.formatTimestamp(stateNew.expireTime, 3)}`);

    this.checkRefreshRule(stateNew);
  }

  makeNewState(debuffEvent, stateOld) {
    const timeRemainOnOld = stateOld ? (stateOld.expireTime - debuffEvent.timestamp) : 0;
    let expireNew = debuffEvent.timestamp + this.durationOfFresh;
    if (timeRemainOnOld > 0) {
      expireNew += Math.min(this.durationOfFresh * PANDEMIC_FRACTION, timeRemainOnOld);
    }

    const combatant = this.selectedCombatant;
    const stateNew = {
      expireTime: expireNew,
      pandemicTime: expireNew - this.durationOfFresh * PANDEMIC_FRACTION,
      buffed: combatant.hasBuff(SPELLS.STEALTH.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.SUBTERFUGE_BUFF.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.STEALTH_BUFF.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.VANISH_BUFF.id, null, BUFF_WINDOW_TIME),
      startTime: debuffEvent.timestamp,
      castEvent: this.lastDoTCastEvent,

      // undefined if the first application of this debuff on this target
      prev: stateOld,
    };

    if (!stateNew.castEvent ||
      stateNew.startTime > stateNew.castEvent.timestamp + CAST_WINDOW_TIME) {
      debug && console.warn(`DoT ${this.constructor.debuffId} applied debuff at ${this.owner.formatTimestamp(debuffEvent.timestamp, 3)} doesn't have a recent matching cast event.`);
    }

    return stateNew;
  }

  checkRefreshRule(stateNew) {
    const stateOld = stateNew.prev;
    const event = stateNew.castEvent;
    if (stateNew.buffed) {
      event.meta = event.meta || {};
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = `This cast snapshotted ` + this.talentName;
    }
    if (!stateOld || stateOld.expireTime < stateNew.startTime) {
      // it's not a refresh, so nothing to check
      return;
    }
    if (stateOld.buffed) {
      this.snapshotTime += stateNew.startTime - stateOld.startTime;
    }
    if (!stateOld.buffed || stateNew.buffed) {
      //didn't overwrite a snapshot with a non snapshot
      return;
    }
    // refresh removed a buffed DoT
    const timeLost = stateOld.expireTime - stateNew.startTime;
    this.lostSnapshotTime += timeLost;
    this.snapshotTime += timeLost;

    // only mark significant time loss events.
    if (timeLost > FORGIVE_LOST_TIME) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You lost ${(timeLost / 1000).toFixed(1)} seconds of a snapshotted DoT by refreshing early without a buff.`;
    }
  }

  get lostSnapshotTimePercent() {
    return (this.lostSnapshotTime / this.snapshotTime) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.lostSnapshotTimePercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You overwrote your snapshotted <SpellLink id={this.constructor.spellCastId} />. Try to always let a snapshotted <SpellLink id={this.constructor.spellCastId} /> expire before applying a non buffed one.</>)
        .icon(this.constructor.spellIcon)
        .actual(i18n._(t('rogue.assassination.suggestions.snapshot.timeLost')`${formatPercentage(actual)}% snapshot time lost`))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

}

export default Snapshot;

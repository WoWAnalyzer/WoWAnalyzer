import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

const DEMONBOLT_SP_COEFFICIENT = 0.667;
const MAX_TRAVEL_TIME = 2000;
const FORBIDDEN_KNOWLEDGE_BUFF_DURATION = 15000;
const INSTANT_CAST_BUFFER = 100;
const debug = false;

// Shadow's Bite and Forbidden Knowledge would share the same logic, so I extracted it into common core
class ShadowsBiteForbiddenKnowledgeCore extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  forbiddenKnowledgeBonus = 0;
  shadowsBiteBonus = 0;

  forbiddenKnowledgeDamage = 0;
  shadowsBiteDamage = 0;

  _lastBeginCast = null;
  _lastFKapply = null;
  _queue = [
    /*
      {
        timestamp: number
        targetID: number,
        targetInstance: number,
        applyFK: boolean
        applySB: boolean
        intellect: number
      }
     */
  ];

  constructor(...args) {
    super(...args);
    const hasFK = this.selectedCombatant.hasTrait(SPELLS.FORBIDDEN_KNOWLEDGE.id);
    const hasSB = this.selectedCombatant.hasTrait(SPELLS.SHADOWS_BITE.id);
    this.active = hasFK || hasSB;
    if (!this.active) {
      return;
    }

    debug && this.log(`SB: ${hasSB}, FK: ${hasFK}`);
    if (hasFK) {
      this.forbiddenKnowledgeBonus = this.selectedCombatant.traitsBySpellId[SPELLS.FORBIDDEN_KNOWLEDGE.id]
        .reduce((total, rank) => {
          const [ damage ] = calculateAzeriteEffects(SPELLS.FORBIDDEN_KNOWLEDGE.id, rank);
          debug && this.log(`FK, rank ${rank}, damage ${damage}`);
          return total + damage;
        }, 0);
    }
    if (hasSB) {
      this.shadowsBiteBonus = this.selectedCombatant.traitsBySpellId[SPELLS.SHADOWS_BITE.id]
        .reduce((total, rank) => {
          const [ damage ] = calculateAzeriteEffects(SPELLS.SHADOWS_BITE.id, rank);
          debug && this.log(`SB, rank ${rank}, damage ${damage}`);
          return total + damage;
        }, 0);
    }

    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onDemonboltBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onDemonboltCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onDemonboltDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FORBIDDEN_KNOWLEDGE_BUFF), this.onForbiddenKnowledgeBuffApply);
  }

  onForbiddenKnowledgeBuffApply(event) {
    this._lastFKapply = event.timestamp;
  }

  onDemonboltBeginCast(event) {
    this._lastBeginCast = event.timestamp;
  }

  onDemonboltCast(event) {
    // Both traits snapshot the "eligibility" for their respective bonus damage on cast, instead of damage
    const isInstant = this._lastBeginCast && event.timestamp < this._lastBeginCast + INSTANT_CAST_BUFFER; // if DB was precasted (_lastBeginCast = null), this should evaluate to false
    const buffedByFK = this._lastFKapply && event.timestamp < this._lastFKapply + FORBIDDEN_KNOWLEDGE_BUFF_DURATION; // if FK buff is consumed, it's removed BEFORE Demonbolt cast, that's why we can't use hasBuff()
    this._lastBeginCast = null;
    this._queue.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      applyFK: buffedByFK && !isInstant,
      applySB: this.selectedCombatant.hasBuff(SPELLS.SHADOWS_BITE_BUFF.id),
      intellect: this.statTracker.currentIntellectRating,
    });
    debug && this.log('Pushed cast into queue, current queue: ', JSON.parse(JSON.stringify(this._queue)));
  }

  onDemonboltDamage(event) {
    // first filter out old casts
    this._queue = this._queue.filter(cast => event.timestamp < (cast.timestamp + MAX_TRAVEL_TIME));
    // try pairing damage event with casts in queue
    const castIndex = this._queue
      .findIndex(queuedCast => queuedCast.targetID === event.targetID
                            && queuedCast.targetInstance === event.targetInstance);
    if (castIndex === -1) {
      debug && this.error('Encountered damage event with no buffed cast associated, queue:', JSON.parse(JSON.stringify(this._queue)), 'event', event);
      return;
    }

    // Both trait bonuses can be active at the same time, and even if we only want one part of it, we need to account for the other part
    // that's why there's another parameter in calculateBonusAzeriteDamage()

    const pairedCast = this._queue[castIndex];
    debug && this.log('Paired damage event with queued cast', pairedCast);

    const fkBonus = (pairedCast.applyFK && this.forbiddenKnowledgeBonus) || 0;
    const sbBonus = (pairedCast.applySB && this.shadowsBiteBonus) || 0;

    debug && this.log(`FK bonus: ${fkBonus}, SB bonus: ${sbBonus}`);

    const [ fkDamage, sbDamage ] = calculateBonusAzeriteDamage(event, [fkBonus, sbBonus], DEMONBOLT_SP_COEFFICIENT, pairedCast.intellect);

    debug && this.log(`FK bonus damage: ${fkDamage}, SB bonus damage: ${sbDamage}`);

    this.forbiddenKnowledgeDamage += fkDamage;
    this.shadowsBiteDamage += sbDamage;

    this._queue.splice(castIndex, 1);
  }
}

export default ShadowsBiteForbiddenKnowledgeCore;

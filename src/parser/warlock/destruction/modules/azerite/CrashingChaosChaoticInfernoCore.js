import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

const CHAOS_BOLT_SP_COEFFICIENT = 1.2;
const MAX_TRAVEL_TIME = 3000;
const debug = false;

/*
  If anyone knows of a more descriptive but shorter name, let me know.
  Shared core implementation of traits Crashing Chaos and Chaotic Inferno. 
  This is needed because both affect Chaos Bolt in an additive way (adding to the base damage)
  and so taking into account only one at a time would produce incorrect results - consider the dmg formula for CB:
  
  dmg = (intellect * 1.2 + crashing_chaos + chaotic_inferno) * multipliers
  
  If we incorrectly left out, let's say "crashing_chaos", while leaving the "dmg" the same, and only counted "chaotic_inferno",
  the "multipliers" would be much higher, and thus returning a much higher value for the scaled "chaotic_inferno" bonus.
*/
class CrashingChaosChaoticInfernoCore extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  crashingChaosBonus = 0;
  chaoticInfernoBonus = 0;

  crashingChaosDamage = 0;
  chaoticInfernoDamage = 0;

  _havoc = null;
  _queue = [
    /*
      {
        timestamp: number
        targetID: number,
        targetInstance: number,
        applyCC: boolean
        intellect: number
        alreadyCleaved: boolean = false
        havoc: object | null,
      }
     */
  ];

  constructor(...args) {
    super(...args);
    const hasCC = this.selectedCombatant.hasTrait(SPELLS.CRASHING_CHAOS.id);
    const hasCI = this.selectedCombatant.hasTrait(SPELLS.CHAOTIC_INFERNO.id);
    this.active = hasCC || hasCI;
    if (!this.active) {
      return;
    }

    debug && this.log(`Chaotic Inferno: ${hasCI}, Crashing Chaos: ${hasCC}`);
    if (hasCC) {
      this.crashingChaosBonus = this.selectedCombatant.traitsBySpellId[SPELLS.CRASHING_CHAOS.id]
        .reduce((total, rank) => {
          const [ damage ] = calculateAzeriteEffects(SPELLS.CRASHING_CHAOS.id, rank);
          debug && this.log(`Crashing Chaos, rank ${rank}, damage ${damage}`);
          return total + damage;
        }, 0);
    }
    if (hasCI) {
      this.chaoticInfernoBonus = this.selectedCombatant.traitsBySpellId[SPELLS.CHAOTIC_INFERNO.id]
        .reduce((total, rank) => {
          const [ damage ] = calculateAzeriteEffects(SPELLS.CHAOTIC_INFERNO.id, rank);
          debug && this.log(`Chaotic Inferno, rank ${rank}, damage ${damage}`);
          return total + damage;
        }, 0);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT), this.onChaosBoltCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT), this.onChaosBoltDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC), this.onHavocApply);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.HAVOC), this.onHavocRemove);
  }

  onHavocApply(event) {
    this._havoc = {
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    };
  }

  onHavocRemove() {
    this._havoc = null;
  }

  onChaosBoltCast(event) {
    this._queue.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      applyCC: this.selectedCombatant.hasBuff(SPELLS.CRASHING_CHAOS_BUFF.id),
      intellect: this.statTracker.currentIntellectRating,
      alreadyCleaved: false,
      havoc: this._havoc,
    });
    debug && this.log('Pushed cast into queue, current queue: ', JSON.parse(JSON.stringify(this._queue)));
  }

  _matchCast(cast, event) {
    let matches = cast.targetID === event.targetID && cast.targetInstance === event.targetInstance;
    if (cast.havoc) {
      matches = matches || (cast.havoc.targetID === event.targetID && cast.havoc.targetInstance === event.targetInstance);
    }
    return matches;
  }

  onChaosBoltDamage(event) {
    // first filter out old casts
    this._queue = this._queue.filter(cast => event.timestamp < (cast.timestamp + MAX_TRAVEL_TIME));
    // try pairing damage event with casts in queue
    const castIndex = this._queue.findIndex(queuedCast => this._matchCast(queuedCast, event));
    if (castIndex === -1) {
      debug && this.error('Encountered damage event with no buffed cast associated, queue:', JSON.parse(JSON.stringify(this._queue)), 'event', event);
      return;
    }

    // Both trait bonuses can be active at the same time, and even if we only want one part of it, we need to account for the other part
    // that's why there's another parameter in calculateBonusAzeriteDamage()

    const pairedCast = this._queue[castIndex];
    debug && this.log('Paired damage event with queued cast', pairedCast);

    const ccBonus = (pairedCast.applyCC && this.crashingChaosBonus) || 0;

    debug && this.log(`Crashing Chaos bonus: ${ccBonus}, Chaotic Inferno bonus: ${this.chaoticInfernoBonus}`);

    const [ ccDamage, ciDamage ] = calculateBonusAzeriteDamage(event, [ccBonus, this.chaoticInfernoBonus], CHAOS_BOLT_SP_COEFFICIENT, pairedCast.intellect);

    debug && this.log(`Crashing Chaos bonus damage: ${ccDamage}, Chaotic Inferno bonus damage: ${ciDamage}`);

    this.crashingChaosDamage += ccDamage;
    this.chaoticInfernoDamage += ciDamage;

    if (pairedCast.havoc && !pairedCast.alreadyCleaved) {
      pairedCast.alreadyCleaved = true;
      debug && this.log('Cleaved hit, flipping flag, current queue:', JSON.parse(JSON.stringify(this._queue)));
      return;
    }
    this._queue.splice(castIndex, 1);
  }
}

export default CrashingChaosChaoticInfernoCore;

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

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
}
export default Snapshot;
export { JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION };

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

const debug = false;

/*
Feral has a snapshotting mechanic which means the effect of some buffs are maintained over the duration of
some DoTs even after the buff has worn off.
Players should follow a number of rules with regards when they refresh a DoT and when they do not, depending
on what buffs the DoT has snapshot and what buffs are currently active.

RAKE snapshots:
  Prowl, Tiger's Fury, Bloodtalons
RIP snapshots:
  Tiger's Fury, Bloodtalons
MOONFIRE_FERAL snapshots:
  Tiger's Fury
THRASH_FERAL snapshots: (but isn't used in single target situations)
  Tiger's Fury, Moment of Clarity

The Snapshot class is 'abstract', and shouldn't be directly instantiated. Instead classes should extend
it and test how well the combatant is making use of the snapshot mechanic.
*/

const TIGERS_FURY_MULTIPLIER = 1.15;
const PROWL_MULTIPLIER = 2.00; // also applied by Incarnation: King of the Jungle, and Shadowmeld
const BLOODTALONS_MULTIPLIER = 1.20;

const JAGGED_WOUNDS_MODIFIER = 0.80;  // "[...]deal the same damage as normal but in 20% less time."
const PANDEMIC_FRACTION = 0.3;

// leeway in ms after loss of bloodtalons/prowl buff to count a cast as being buffed. Keep as low as possible to avoid false positives from buffs fading due to causes other than being used to buff a DoT.
const BUFF_WINDOW_TIME = 60;
// leeway in ms between a cast event and debuff apply/refresh for them to be associated
const CAST_WINDOW_TIME = 100;

class Snapshot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // extending class should fill these in:
  spellCastId;
  debuffId;
  isProwlAffected;
  isTigersFuryAffected;
  isBloodtalonsAffected;
  durationOfFresh;

  stateByTarget = {};
  lastDoTCastEvent;

  on_byPlayer_cast(event) {
    if (this.spellCastId !== event.ability.guid) {
      return;
    }
    this.lastDoTCastEvent = event;
    
    // attempt to associate with (very) recent debuff apply/refresh
    // this cast could apply DoTs to multiple targets, so check them all
    Object.values(this.stateByTarget).forEach(state => {
      if (!state.castEvent && event.timestamp - state.startTime < CAST_WINDOW_TIME) {
        event.castEvent = event;
        this.checkRuleIfReady(state);
      }
    });
  }

  on_byPlayer_applydebuff(event) {
    if (this.debuffId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  on_byPlayer_refreshdebuff(event) {
    if (this.debuffId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  dotApplied(event) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const stateOld = this.stateByTarget[targetString];
    const stateNew = this.makeNewState(event, stateOld);
    this.stateByTarget[targetString] = stateNew;

    debug && console.log(`DoT ${this.debuffId} applied at ${this.owner.formatTimestamp(event.timestamp)} Prowl:${stateNew.prowl}, TF: ${stateNew.tigersFury}, BT: ${stateNew.bloodtalons}. Expires at ${this.owner.formatTimestamp(stateNew.expireTime)}, pandemic from: ${this.owner.formatTimestamp(stateNew.pandemicTime)}`);

    this.checkRuleIfReady(stateNew);
  }

  makeNewState(debuffEvent, stateOld) {
    const timeRemainOnOld = stateOld ? (stateOld.expireTime - debuffEvent.timestamp) : 0;
    let expireNew = debuffEvent.timestamp + this.durationOfFresh;
    if (timeRemainOnOld > 0) {
      expireNew += Math.min(this.durationOfFresh * PANDEMIC_FRACTION, timeRemainOnOld);
    }

    const combatant = this.combatants.selected;
    const stateNew = {
      expireTime: expireNew,
      pandemicTime: expireNew - this.durationOfFresh * PANDEMIC_FRACTION,
      tigersFury: this.isTigersFuryAffected &&
        combatant.hasBuff(SPELLS.TIGERS_FURY.id),
      prowl: this.isProwlAffected && (
        combatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) ||
        combatant.hasBuff(SPELLS.PROWL.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.PROWL_INCARNATION.id, null, BUFF_WINDOW_TIME) ||
        combatant.hasBuff(SPELLS.SHADOWMELD.id, null, BUFF_WINDOW_TIME)
      ),
      bloodtalons: this.isBloodtalonsAffected &&
        combatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, null, BUFF_WINDOW_TIME),
      power: 1,
      startTime: debuffEvent.timestamp,
      castEvent: null,  // should get assigned within the next 100ms
      prev: stateOld,   // may be undefined
      hasBeenRuleChecked: false,
    };
    stateNew.power = this.calcPower(stateNew);

    // attempt to associate with recent cast event
    if (this.lastDoTCastEvent && (debuffEvent.timestamp - this.lastDoTCastEvent.timestamp) < CAST_WINDOW_TIME) {
      stateNew.castEvent = this.lastDoTCastEvent;
      debug && console.log('linked DoT with cast event.');
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

  checkRuleIfReady(state) {
    // only check a state transition for rule-breaking once, and only after it has a cast event associated with it.
    if (!state.hasBeenRuleChecked && state.castEvent) {
      this.checkRefreshRule(state);
      state.hasBeenRuleChecked = true;
    }
  }

  checkRefreshRule(state) {
    debug && console.warn('Expected checkRefreshRule function to be overridden.');
  }
}
export default Snapshot;
export { JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION };

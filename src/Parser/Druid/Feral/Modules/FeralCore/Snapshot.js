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

// leeway in ms after loss of bloodtalons/prowl buff to count a cast as being buffed. Keep well below GCD to avoid false positives.
const BUFF_WINDOW_TIME = 300;

class Snapshot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // extending class should fill these in:
  spellCastId;
  isProwlAffected;
  isTigersFuryAffected;
  isBloodtalonsAffected;
  durationOfFresh;

  // initialised to before combat log starts to avoid false positives
  bloodtalonsFadedAt = -10000;
  prowlFadedAt = -10000;

  stateByTarget = [];

  // It's common for buffs that are consumed by an ability to be reported as not present when the ability's event is processed.
  // So record when the buff wears off, and if that's sufficiently close to the ability being used we can assume it was active.
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (this.isProwlAffected && (
        SPELLS.PROWL.id === spellId ||
        SPELLS.PROWL_INCARNATION.id === spellId || 
        SPELLS.SHADOWMELD.id === spellId)) {
      this.prowlFadedAt = event.timestamp;
    } else if (this.isBloodtalonsAffected && SPELLS.BLOODTALONS_BUFF.id === spellId) {
      this.bloodtalonsFadedAt = event.timestamp;
    }
  }

  on_byPlayer_cast(event) {
    if (this.spellCastId !== event.ability.guid) {
      return;
    }
    this.dotApplied(event);
  }

  dotApplied(event) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const stateOld = this.stateByTarget[targetString];
    const timeRemainOnOld = stateOld ? (stateOld.expireTime - event.timestamp) : 0;
    const stateNew = this.makeNewState(event, timeRemainOnOld);
    this.stateByTarget[targetString] = stateNew;
    debug && console.log(`DoT ${this.spellCastId} applied at ${this.owner.formatTimestamp(event.timestamp)} Prowl:${stateNew.prowl}, TF: ${stateNew.tigersFury}, BT: ${stateNew.bloodtalons}. Expires at ${this.owner.formatTimestamp(stateNew.expireTime)}, pandemic from: ${this.owner.formatTimestamp(stateNew.pandemicTime)}`);

    if (timeRemainOnOld > 0) {
      this.checkRefreshRule(event, stateOld, stateNew);
    }
  }

  makeNewState(event, timeRemainOnOld) {
    const combatant = this.combatants.selected;

    let expireNew = event.timestamp + this.durationOfFresh;
    if (timeRemainOnOld > 0) {
      expireNew += Math.min(this.durationOfFresh * PANDEMIC_FRACTION, timeRemainOnOld);
    }

    const stateNew = {
      expireTime: expireNew,
      pandemicTime: expireNew - this.durationOfFresh * PANDEMIC_FRACTION, // after this time the DoT is in the "pandemic window"
      tigersFury: false,
      prowl: false,
      bloodtalons: false,
      power: 1,
    };
    if (this.isProwlAffected && (combatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id, event.timestamp) ||
        event.timestamp < this.prowlFadedAt + BUFF_WINDOW_TIME)) {
      stateNew.prowl = true;
      stateNew.power *= PROWL_MULTIPLIER;
    }
    if (this.isTigersFuryAffected && combatant.hasBuff(SPELLS.TIGERS_FURY.id, event.timestamp)) {
      stateNew.tigersFury = true;
      stateNew.power *= TIGERS_FURY_MULTIPLIER;
    }
    if (this.isBloodtalonsAffected && (combatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, event.timestamp) ||
        event.timestamp < this.bloodtalonsFadedAt + BUFF_WINDOW_TIME)) {
      stateNew.bloodtalons = true;
      stateNew.power *= BLOODTALONS_MULTIPLIER;
    }
    return stateNew;
  }

  checkRefreshRule(event, stateOld, stateNew) {
    debug && console.warn('Expected checkRefreshRule function to be overridden.');
  }
}
export default Snapshot;
export { JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION };

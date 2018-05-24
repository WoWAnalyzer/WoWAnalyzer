import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus'; // relative path would be long and ugly

const PATIENT_SNIPER_BONUS_PER_SEC = 0.06;
const VULNERABLE_DURATION = 7000;
const LAG_TOLERANCE = 300;
const MAX_AIMED_SHOT_TRAVEL_TIME = 1000;

const debug = false;
 /**
  * Gain the patience of a veteran sniper, increasing the damage bonus of Vulnerable by 6% every 1 sec.
  */
class PatientSniperTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  /*
  A module to track the effectiveness of the Patient Sniper talent
  > Apply Vulnerable
  > 0-0.99seconds passed = 0% = patientSniper[spell].[noTS|TS].seconds[0]
  > 1-1.99seconds passed = 6% = patientSniper[spell].[noTS|TS].seconds[1]
  > 2-2.99seconds passed = 12% = patientSniper[spell].[noTS|TS].seconds[2]
  > 3-3.99seconds passed = 18% = patientSniper[spell].[noTS|TS].seconds[3]
  > 4-4.99seconds passed = 24% = patientSniper[spell].[noTS|TS].seconds[4]
  > 5-5.99seconds passed = 30% = patientSniper[spell].[noTS|TS].seconds[5]
  > 6-6.99seconds passed = 36% = patientSniper[spell].[noTS|TS].seconds[6]
  > Vulnerable fades from the target
  */

  //Patient Sniper for Aimed Shots - Without and With Trueshot
  patientSniper = {
    [SPELLS.AIMED_SHOT.id]: {
      bonusDmg: 0,
      noTS: {
        noVulnerable: 0,
        seconds: {
          0: {
            count: 0,
            damage: 0,
          },
          1: {
            count: 0,
            damage: 0,
          },
          2: {
            count: 0,
            damage: 0,
          },
          3: {
            count: 0,
            damage: 0,
          },
          4: {
            count: 0,
            damage: 0,
          },
          5: {
            count: 0,
            damage: 0,
          },
          6: {
            count: 0,
            damage: 0,
          },
        },
        count: 0,
      },
      TS: {
        noVulnerable: 0,
        seconds: {
          0: {
            count: 0,
            damage: 0,
          },
          1: {
            count: 0,
            damage: 0,
          },
          2: {
            count: 0,
            damage: 0,
          },
          3: {
            count: 0,
            damage: 0,
          },
          4: {
            count: 0,
            damage: 0,
          },
          5: {
            count: 0,
            damage: 0,
          },
          6: {
            count: 0,
            damage: 0,
          },
        },
        count: 0,
      },
    },
    [SPELLS.PIERCING_SHOT_TALENT.id]: {
      bonusDmg: 0,
      noTS: {
        noVulnerable: 0,
        seconds: {
          0: {
            count: 0,
            damage: 0,
          },
          1: {
            count: 0,
            damage: 0,
          },
          2: {
            count: 0,
            damage: 0,
          },
          3: {
            count: 0,
            damage: 0,
          },
          4: {
            count: 0,
            damage: 0,
          },
          5: {
            count: 0,
            damage: 0,
          },
          6: {
            count: 0,
            damage: 0,
          },
        },
        count: 0,
      },
      TS: {
        noVulnerable: 0,
        seconds: {
          0: {
            count: 0,
            damage: 0,
          },
          1: {
            count: 0,
            damage: 0,
          },
          2: {
            count: 0,
            damage: 0,
          },
          3: {
            count: 0,
            damage: 0,
          },
          4: {
            count: 0,
            damage: 0,
          },
          5: {
            count: 0,
            damage: 0,
          },
          6: {
            count: 0,
            damage: 0,
          },
        },
        count: 0,
      },
    },
  };

  currentVulnerables = [];
  pastVulnerables = [];

  // Aimed Shots can be fired quickly after one another (up to 2), and each can have different Patient Sniper bonus, so we can't track the bonus from "last Aimed cast"
  aimedShotQueue = [];

  // Piercing Shot has 30s CD so queue isn't necessary
  lastPiercingShotTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.VULNERABLE.id) {
      return;
    }
    this.currentVulnerables.push({
      start: event.timestamp,
      end: event.timestamp + VULNERABLE_DURATION,
      ID: event.targetID,
      instance: event.targetInstance,
    });
  }

  // Vulnerable debuffs don't get refreshed, it's always removed and applied again
  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.VULNERABLE.id) {
      return;
    }
    // find Vulnerable on the target, update its end, add to past Vulnerables and remove from current ones
    const index = this.currentVulnerables.findIndex(vulnerable => vulnerable.ID === event.targetID && vulnerable.instance === event.targetInstance);
    const vulnerable = this.currentVulnerables[index];
    if(!vulnerable) {
      return;
    }
    vulnerable.end = event.timestamp;
    this.pastVulnerables.push(vulnerable);
    this.currentVulnerables.splice(index, 1);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }

    const hasTS = this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id, event.timestamp);

    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id) {
      this.lastPiercingShotTimestamp = event.timestamp;
    }

    // find Vulnerable on current target
    const vulnerable = this.currentVulnerables.find(vulnerable => vulnerable.ID === event.targetID && vulnerable.instance === event.targetInstance);
    const hasVulnerability = !!vulnerable;
    // if Vulnerable isn't present, then vulnerableStart and timeIntoVulnerable don't make sense and are basically unused, it's just so the app doesn't crash from undefineds
    // I wasn't sure with const vulnerableStart = (vulnerable && vulnerable.start) || 0;
    let vulnerableStart = 0;
    if (vulnerable) {
      vulnerableStart = vulnerable.start;
    }
    let timeDifference = event.timestamp - vulnerableStart;
    if (timeDifference >= VULNERABLE_DURATION && timeDifference <= (VULNERABLE_DURATION + LAG_TOLERANCE)) {
      // if the difference is [7000, 7100] ms, count it as a 6 second into Vulnerable (this can happen due to slight lag, its 7000ms duration runs out but removedebuff() wasn't yet called
      // so the buff lingers in currentVulnerables and timeDifference is > 7000ms which produces "7 seconds into vulnerable" which results in error
      timeDifference = 6500; // set a neutral value halfway past 6000 so dividing and flooring gives correct result
    }
    let timeIntoVulnerable = Math.floor(timeDifference / 1000);
    //if our LAG_TOLERANCE didn't work, or the log somehow is missing a APPLYDEBUFF or REMOVEDEBUFF event for vulnerable, this will hardcode it into max value (as it will be in-game in majority of cases as it later checks if vulnerable is still on the target)
    if(timeIntoVulnerable>6) {
      debug && console.log('emergency fix had to be used', event.timestamp);
      timeIntoVulnerable = 6;
    }
    debug && console.log('timestamp: ', event.timestamp, '. Time into vulnerable: ', timeIntoVulnerable, '. TargetID: ', event.targetID);
    // this "event" is intended for Aimed Shot only
    // since Vulnerable and Patient Sniper bonuses are snapshotted at the moment of the cast (and not when the shot lands)
    // store current target and time passed in Vulnerable (= damage bonus essentially)
    const castEvent = {
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      timeIntoVulnerable: undefined, // assume outside Vulnerable
    };

    // correctly count the shots based on Trueshot buff present and Vulnerability on target
    if (hasTS) {
      this.patientSniper[spellId].TS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].TS.seconds[timeIntoVulnerable].count += 1;
        castEvent.timeIntoVulnerable = timeIntoVulnerable;
      } else {
        this.patientSniper[spellId].TS.noVulnerable += 1;
      }
    } else {
      this.patientSniper[spellId].noTS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].noTS.seconds[timeIntoVulnerable].count += 1;
        castEvent.timeIntoVulnerable = timeIntoVulnerable;
      } else {
        this.patientSniper[spellId].noTS.noVulnerable += 1;
      }
    }

    // if it's Aimed Shot, push the event into the queue
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.aimedShotQueue.push(castEvent);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }

    let timeIntoVulnerable;
    if (spellId === SPELLS.AIMED_SHOT.id) {
      // look at the "oldest" Aimed Shot cast event and try to match it with the damage event (as for the target ID + instance)
      // this is necessary because of Trick Shot talent which makes the Aimed Shot cleave (for 30 % damage) in certain conditions (and the cleaved shots have same ID as normal shots)
      // and we only calculate the bonus for the main target (otherwise it would double-dip from the bonus)
      this.aimedShotQueue = this.aimedShotQueue.filter(e => e.timestamp >= (event.timestamp - MAX_AIMED_SHOT_TRAVEL_TIME)); // filter out events too old (can happen at Sisters of the Moon when boss disappears (cast happens, damage never lands))
      const firstAimed = this.aimedShotQueue[0];
      if (!firstAimed || firstAimed.targetID !== event.targetID || firstAimed.targetInstance !== event.targetInstance) {
        // either it's cleaved or it doesn't exist (this can happen if the main target damage arrives sooner than cleaved damage event)
        return;
      }
      else {
        // this is main target the Aimed was shot at
        timeIntoVulnerable = firstAimed.timeIntoVulnerable;
        this.aimedShotQueue.splice(0, 1); // we've matched the main Aimed Shot cast event with damage event, we can remove the event from queue
      }
    }
    else {
      // for Piercing Shots
      timeIntoVulnerable = this._getTimeIntoVulnerable(this.lastPiercingShotTimestamp, event.targetID, event.targetInstance);
    }

    // here timeIntoVulnerable either is undefined (cast happened outside Vulnerable) or has seconds into the individual Vulnerable window
    const bonus = getDamageBonus(event, (timeIntoVulnerable || 0) * PATIENT_SNIPER_BONUS_PER_SEC);
    this.patientSniper[spellId].bonusDmg += bonus;

    // "categorize" the damage bonus into respective window
    if (timeIntoVulnerable !== undefined) {
      const hasTS = this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id, event.timestamp);
      if (hasTS) {
        this.patientSniper[spellId].TS.seconds[timeIntoVulnerable].damage += bonus;
      } else {
        this.patientSniper[spellId].noTS.seconds[timeIntoVulnerable].damage += bonus;
      }
    }
  }

  // helper for Piercing Shot
  _getTimeIntoVulnerable(castTimestamp, targetID, targetInstance) {
    // Piercing Shot damages the main target and all targets in the path which can have their own Vulnerables with different times
    // this helper looks for Vulnerable debuffs (either current or if not present, tries past windows) on a given target+instance when castTimestamp happened
    // calculates the Patient Sniper bonus from that window or returns undefined if no windows were found
    let vulnerable = this.currentVulnerables.find(v => v.ID === targetID &&
      v.instance === targetInstance &&
      v.start <= castTimestamp &&
      castTimestamp <= v.end);
    if (!vulnerable) {
      vulnerable = this.pastVulnerables.find(v => v.ID === targetID &&
        v.instance === targetInstance &&
        v.start <= castTimestamp &&
        castTimestamp <= v.end);
    }
    // consistent with what I queue from Aimed Shot cast events - undefined if shot outside of Vulnerable, otherwise seconds into Vulnerable
    return (!vulnerable) ? undefined : Math.floor((castTimestamp - vulnerable.start) / 1000);
  }
}

export default PatientSniperTracker;

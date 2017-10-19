import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import getDamageBonus from 'Parser/Hunter/Shared/Core/getDamageBonus'; // relative path would be long and ugly

const PATIENT_SNIPER_BONUS_PER_SEC = 0.06;
const VULNERABLE_DURATION = 7000;

class PatientSniperTracker extends Module {

  static dependencies = {
    enemies: Enemies,
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
      end:  event.timestamp + VULNERABLE_DURATION,
      ID: event.targetID,
      instance: event.targetInstance,
    });
  }
  // Vulnerable debuff doesn't get refreshed, it's always removed and applied again
  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.VULNERABLE.id) {
      return;
    }
    const index = this.currentVulnerables.findIndex(vulnerable => vulnerable.ID === event.targetID && vulnerable.instance === event.targetInstance);
    const vulnerable = this.currentVulnerables[index];
    vulnerable.end = event.timestamp;
    this.pastVulnerables.push(vulnerable);
    this.currentVulnerables.splice(index, 1);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);
    // sanity check, happens sometimes
    if (!enemy) {
      return;
    }
    const hasTS = this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id, event.timestamp);

    // Vulnerable is taken care of in apply/refreshdebuff
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }

    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id) {
      this.lastPiercingShotTimestamp = event.timestamp;
    }
    const vulnerable = this.currentVulnerables.find(vulnerable => vulnerable.ID === event.targetID && vulnerable.instance === event.targetInstance);
    const hasVulnerability = !!vulnerable;
    let vulnerableStart = 0;
    if (vulnerable) {
      vulnerableStart = vulnerable.start;
    }
    const timeIntoVulnerable = Math.floor((eventTimestamp - vulnerableStart) / 1000);

    const castEvent = {
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      timeIntoVulnerable: undefined, // assume outside vulnerable
    };

    if (hasTS) {
      this.patientSniper[spellId].TS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].TS.seconds[timeIntoVulnerable].count += 1;
        castEvent.timeIntoVulnerable = timeIntoVulnerable;
      }
      else {
        this.patientSniper[spellId].TS.noVulnerable += 1;
      }
    }
    else {
      this.patientSniper[spellId].noTS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].noTS.seconds[timeIntoVulnerable].count += 1;
        castEvent.timeIntoVulnerable = timeIntoVulnerable;
      }
      else {
        this.patientSniper[spellId].noTS.noVulnerable += 1;
      }
    }
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
      const firstAimed = this.aimedShotQueue[0];
      if (!firstAimed || firstAimed.targetID !== event.targetID || firstAimed.targetInstance !== event.targetInstance) {
        // if we come across an Aimed Shot damage that wasn't on the primary target of the first Aimed cast, we don't even calculate the damage bonus
        // that shot is cleaved from Trick Shot talent, and it would double-dip from Patient Sniper bonus
        return;
      }
      else {
        // this is main target the Aimed was shot at
        timeIntoVulnerable = firstAimed.timeIntoVulnerable;
        this.aimedShotQueue.splice(0, 1); // we've matched the main Aimed Shot cast event with damage event, we can remove the event from queue
      }
    }
    else {
      timeIntoVulnerable = this._getTimeIntoVulnerable(this.lastPiercingShotTimestamp, event.targetID, event.targetInstance);
    }

    const bonus = getDamageBonus(event, (timeIntoVulnerable || 0) * PATIENT_SNIPER_BONUS_PER_SEC);
    this.patientSniper[spellId].bonusDmg += bonus;
    if (timeIntoVulnerable !== undefined) {
      const hasTS = this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id, event.timestamp);
      if (hasTS) {
        this.patientSniper[spellId].TS.seconds[timeIntoVulnerable].damage += bonus;
      }
      else {
        this.patientSniper[spellId].noTS.seconds[timeIntoVulnerable].damage += bonus;
      }
    }
  }

  // helper for Piercing Shot
  _getTimeIntoVulnerable(castTimestamp, targetID, targetInstance) {
    // looks for Vulnerable window (either current or if not present, tries past windows) on a given target+instance when castTimestamp happened, calculates the Patient Sniper bonus from that window or returns 0 if no windows were found
    let vulnerable = this.currentVulnerables.find(v => v.ID === targetID &&
                                                      v.instance === targetInstance &&
                                                      v.start <= castTimestamp  &&
                                                      castTimestamp <= v.end);
    if (!vulnerable) {
      vulnerable = this.pastVulnerables.find(v => v.ID === targetID &&
                                                  v.instance === targetInstance &&
                                                  v.start <= castTimestamp  &&
                                                  castTimestamp <= v.end);
    }
    // consistent with what I queue from Aimed Shot cast events - undefined if shot outside of Vulnerable, otherwise seconds into Vulnerable
    return (!vulnerable) ? undefined : Math.floor((castTimestamp - vulnerable.start) / 1000);
  }
}

export default PatientSniperTracker;

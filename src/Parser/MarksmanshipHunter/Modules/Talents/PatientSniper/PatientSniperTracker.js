import React from 'react';

import Module from 'Parser/Core/Module';
import PropTypes from 'prop-types';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from "Main/StatisticBox";

import { formatPercentage } from 'common/format';

class PatientSniperTracker extends Module {

  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  /*
  A module to track the effectiveness of the Patient Sniper talent
  > Apply Vulnerable
  > 0-0.99seconds passed = 0% = zeroSecondsIntoVulnerableAimed
  > 1-1.99seconds passed = 6% = oneSecondIntoVulnerableAimed
  > 2-2.99seconds passed = 12% = twoSecondsIntoVulnerableAimed
  > 3-3.99seconds passed = 18% = threeSecondsIntoVulnerableAimed
  > 4-4.99seconds passed = 24% = fourSecondsIntoVulnerableAimed
  > 5-5.99seconds passed = 30% = fiveSecondsIntoVulnerableAimed
  > 6-6.99seconds passed = 36% = sixSecondsIntoVulnerableAimed
  > Vulnerable fades from the target
  */

  //Patient Sniper for Aimed Shots
  nonVulnerableAimedShots = 0;
  zeroSecondsIntoVulnerableAimed = 0;
  oneSecondIntoVulnerableAimed = 0;
  twoSecondsIntoVulnerableAimed = 0;
  threeSecondsIntoVulnerableAimed = 0;
  fourSecondsIntoVulnerableAimed = 0;
  fiveSecondsIntoVulnerableAimed = 0;
  sixSecondsIntoVulnerableAimed = 0;

  //Patient Sniper for Piercing Shots
  nonVulnerablePiercingShots = 0;
  zeroSecondsIntoVulnerablePiercing = 0;
  oneSecondIntoVulnerablePiercing = 0;
  twoSecondsIntoVulnerablePiercing = 0;
  threeSecondsIntoVulnerablePiercing = 0;
  fourSecondsIntoVulnerablePiercing = 0;
  fiveSecondsIntoVulnerablePiercing = 0;
  sixSecondsIntoVulnerablePiercing = 0;

  lastVulnerableTimestamp = null;
  timeIntoVulnerable = 0;
  totalVulnWindows = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);
// Removing trueshot windows from calculations, as these windows make you play differently than you otherwise would.

    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.MARKED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }
    if (spellId === SPELLS.MARKED_SHOT.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
      if (this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
        return;
      } else {
        this.totalVulnWindows += 1;
        return;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        switch (this.timeIntoVulnerable) {
          case 0:
            this.zeroSecondsIntoVulnerableAimed += 1;
            break;
          case 1:
            this.oneSecondIntoVulnerableAimed += 1;
            break;
          case 2:
            this.twoSecondsIntoVulnerableAimed += 1;
            break;
          case 3:
            this.threeSecondsIntoVulnerableAimed += 1;
            break;
          case 4:
            this.fourSecondsIntoVulnerableAimed += 1;
            break;
          case 5:
            this.fiveSecondsIntoVulnerableAimed += 1;
            break;
          case 6:
            this.sixSecondsIntoVulnerableAimed += 1;
            break;
          default:
            break;
        }
      } else {
        this.nonVulnerableAimedShots += 1;
      }
    }
    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id) {
      switch (this.timeIntoVulnerable) {
        case 0:
          this.zeroSecondsIntoVulnerablePiercing += 1;
          break;
        case 1:
          this.oneSecondIntoVulnerablePiercing += 1;
          break;
        case 2:
          this.twoSecondsIntoVulnerablePiercing += 1;
          break;
        case 3:
          this.threeSecondsIntoVulnerablePiercing += 1;
          break;
        case 4:
          this.fourSecondsIntoVulnerablePiercing += 1;
          break;
        case 5:
          this.fiveSecondsIntoVulnerablePiercing += 1;
          break;
        case 6:
          this.sixSecondsIntoVulnerablePiercing += 1;
          break;
        default:
          break;
      }
    } else {
      this.nonVulnerablePiercingShots += 1;
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;

    //we're only interested in windburst here
    if (spellId === SPELLS.WINDBURST.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
      if (this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
        return;
      } else {
        this.totalVulnWindows += 1;
      }
    } else {
      return;
    }
    return this.lastVulnerableTimestamp;
  }

}

export default PatientSniperTracker;

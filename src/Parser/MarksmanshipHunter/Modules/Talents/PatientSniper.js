import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from "Main/StatisticBox";

import { formatPercentage } from 'common/format';

class PatientSniper extends Module {

  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from "Main/StatisticBox";

import AimedInVulnerableTracker from '/Features/AimedInVulnerableTracker';
import { formatPercentage } from "../../../../common/format";

class PatientSniper extends Module {

  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  /*
  A module to track the effectiveness of the Patient Sniper talent
  > Apply Vulnerable
  > 0-0.99seconds passed = 0%
  > 1-1.99seconds passed = 6%
  > 2-2.99seconds passed = 12%
  > 3-3.99seconds passed = 18%
  > 4-4.99seconds passed = 24%
  > 5-5.99seconds passed = 30%
  > 6-6.99seconds passed = 36%
  > Vulnerable fades from the target
  */

  //The various levels of patient sniper
  nonVulnerableAimedShots = 0;
  zeroSecondsIntoVulnerable = 0;
  oneSecondIntoVulnerable = 0;
  twoSecondsIntoVulnerable = 0;
  threeSecondsIntoVulnerable = 0;
  fourSecondsIntoVulnerable = 0;
  fiveSecondsIntoVulnerable = 0;
  sixSecondsIntoVulnerable = 0;
  lastVulnerableTimestamp = null;
  timeIntoVulnerable = 0;
*/
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);

    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.MARKED_SHOT.id) {
      return;
    }
    if (spellId === SPELLS.MARKED_SHOT.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
      return;
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        switch (this.timeIntoVulnerable) {
          case 0:
            this.zeroSecondsIntoVulnerable += 1;
            break;
          case 1:
            this.oneSecondIntoVulnerable += 1;
            break;
          case 2:
            this.twoSecondsIntoVulnerable += 1;
            break;
          case 3:
            this.threeSecondsIntoVulnerable += 1;
            break;
          case 4:
            this.fourSecondsIntoVulnerable += 1;
            break;
          case 5:
            this.fiveSecondsIntoVulnerable += 1;
            break;
          case 6:
            this.sixSecondsIntoVulnerable += 1;
            break;
          default:
            break;
        }
      }
      else {
        this.nonVulnerableAimedShots += 1;
      }
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;

    //we're only interested in windburst here
    if (spellId === SPELLS.WINDBURST.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
    }
    else {
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);

    if (spellId !== SPELLS.AIMED_SHOT.id || spellId !== SPELLS.MARKED_SHOT.id) {
      return;
    }
    return this.lastVulnerableTimestamp;
  }
  suggestions(when) {
=======
    if (spellId === SPELLS.MARKED_SHOT.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
        this.timeIntoVulnerable = eventTimestamp - this.lastVulnerableTimestamp;
        switch (this.timeIntoVulnerable / 1000) {
          case 0:
            this.zeroSecondsIntoVulnerable += 1;
            break;
          case 1:
            this.oneSecondIntoVulnerable += 1;
            break;
          case 2:
            this.twoSecondsIntoVulnerable += 1;
            break;
          case 3:
            this.threeSecondsIntoVulnerable += 1;
            break;
          case 4:
            this.fourSecondsIntoVulnerable += 1;
            break;
          case 5:
            this.fiveSecondsIntoVulnerable += 1;
            break;
          case 6:
            this.sixSecondsIntoVulnerable += 1;
            break;
          default:
            break;
        }
      }
      else {
        this.nonVulnerableAimedShots += 1;
      }
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;

    //we're only interested in windburst here
    if (spellId !== SPELLS.WINDBURST.id) {
      return;
    }
    else {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
    }
    return this.lastVulnerableTimestamp;
  }

  statistic() {
    const percentGoodAimedShots = (this.threeSecondsIntoVulnerable+this.fourSecondsIntoVulnerable+this.fiveSecondsIntoVulnerable+this.sixSecondsIntoVulnerable) / AimedInVulnerableTracker.totalAimed;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`${formatPercentage(percentGoodAimedShots)}%`}
        label="Aimed Shots 3+ seconds into Vulnerable"
      tooltip={``}/>
    );
  }
  statistic() {
    const totalAimedShotIncrease = (this.nonVulnerableAimedShots * 0) + (this.oneSecondIntoVulnerable * 6) + (this.twoSecondsIntoVulnerable * 12) + (this.threeSecondsIntoVulnerable * 18) + (this.fourSecondsIntoVulnerable * 24) + (this.fiveSecondsIntoVulnerable * 30) + (this.sixSecondsIntoVulnerable * 36);
    const totalAimedShots = this.nonVulnerableAimedShots + this.oneSecondIntoVulnerable + this.twoSecondsIntoVulnerable + this.threeSecondsIntoVulnerable + this.fourSecondsIntoVulnerable + this.fiveSecondsIntoVulnerable + this.sixSecondsIntoVulnerable;
    const averageAimedShotDamageIncrease = totalAimedShotIncrease / totalAimedShots / 100;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`${formatPercentage(averageAimedShotDamageIncrease)}%`}
        label="Average damage gain"
        tooltip={`Non-vulnerable aimed shots: ${this.nonVulnerableAimedShots} <br />
0% increased damage: ${this.zeroSecondsIntoVulnerable} Aimed Shots <br/>
6% increased damage: ${this.oneSecondIntoVulnerable} Aimed Shots<br/>
12% increased damage: ${this.twoSecondsIntoVulnerable} Aimed Shots<br/>
18% increased damage: ${this.threeSecondsIntoVulnerable} Aimed Shots<br/>
24% increased damage: ${this.fourSecondsIntoVulnerable} Aimed Shots<br/>
30% increased damage: ${this.fiveSecondsIntoVulnerable} Aimed Shots<br/>
36% increased damage: ${this.sixSecondsIntoVulnerable} Aimed Shots<br/>`} />
    );
  }
  const
  enemy = this.enemies.getEntity(event);
  if(
!
  enemy
.
  hasBuff(SPELLS
.
  VULNERABLE
.
  id
)) {
  return;
}

if (enemy.refreshBuff(SPELLS.VULNERABLE.id)) {

}

}

}

export default PatientSniper;

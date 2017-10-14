import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

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

  //Patient Sniper for Aimed Shots - Without and With Trueshot
  patientSniper = {
    [SPELLS.AIMED_SHOT.id]: {
      nonVulnerableAimedShots: 0,
      zeroSecondsIntoVulnerableAimed: 0,
      oneSecondIntoVulnerableAimed: 0,
      twoSecondsIntoVulnerableAimed: 0,
      threeSecondsIntoVulnerableAimed: 0,
      fourSecondsIntoVulnerableAimed: 0,
      fiveSecondsIntoVulnerableAimed: 0,
      sixSecondsIntoVulnerableAimed: 0,
      nonVulnerableAimedShotsTS: 0,
      zeroSecondsIntoVulnerableAimedTS: 0,
      oneSecondIntoVulnerableAimedTS: 0,
      twoSecondsIntoVulnerableAimedTS: 0,
      threeSecondsIntoVulnerableAimedTS: 0,
      fourSecondsIntoVulnerableAimedTS: 0,
      fiveSecondsIntoVulnerableAimedTS: 0,
      sixSecondsIntoVulnerableAimedTS: 0,
    },
    [SPELLS.PIERCING_SHOT_TALENT.id]: {
      nonVulnerablePiercingShots: 0,
      zeroSecondsIntoVulnerablePiercing: 0,
      oneSecondIntoVulnerablePiercing: 0,
      twoSecondsIntoVulnerablePiercing: 0,
      threeSecondsIntoVulnerablePiercing: 0,
      fourSecondsIntoVulnerablePiercing: 0,
      fiveSecondsIntoVulnerablePiercing: 0,
      sixSecondsIntoVulnerablePiercing: 0,
      nonVulnerablePiercingShotsTS: 0,
      zeroSecondsIntoVulnerablePiercingTS: 0,
      oneSecondIntoVulnerablePiercingTS: 0,
      twoSecondsIntoVulnerablePiercingTS: 0,
      threeSecondsIntoVulnerablePiercingTS: 0,
      fourSecondsIntoVulnerablePiercingTS: 0,
      fiveSecondsIntoVulnerablePiercingTS: 0,
      sixSecondsIntoVulnerablePiercingTS: 0,
    },
  };

  //increases from patient sniper
  aimedShotDmgIncreaseNoTS = 0;
  aimedShotDmgIncreaseWithTS = 0;
  piercingShotDmgIncreaseNoTS = 0;
  piercingShotDmgIncreaseWithTS = 0;

  //Vulnerable variables
  lastVulnerableTimestamp = 0;
  timeIntoVulnerable = 0;
  vulnWindowsNoTS = 0;
  totalVulnWindows = 0;
  vulnerableModifer = 0.3;

  //Counts for Aimed/Piercing Shots
  aimedShotsNoTS = 0;
  aimedShotsWithTS = 0;
  piercingShotsNoTS = 0;
  piercingShotsWithTS = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
    const unerringArrowsRank = this.combatants.selected.traitsBySpellId[SPELLS.UNERRING_ARROWS_TRAIT.id];
    this.vulnerableModifier += unerringArrowsRank * 0.03;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);

    //We only care about these 3 in casts as Windburst is handled in damage
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.MARKED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }
    if (spellId === SPELLS.MARKED_SHOT.id) {
      //vulnerable is reset, so we get new timestamp
      this.lastVulnerableTimestamp = eventTimestamp;
      //Ensures we have calculations for all vuln windows, and purely non-TS vuln windows
      if (!this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
        this.vulnWindowsNoTS += 1;
        this.totalVulnWindows += 1;
      } else {
        this.totalVulnWindows += 1;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id && !this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.aimedShotsNoTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor(((eventTimestamp - this.lastVulnerableTimestamp) / 1000));
        this.aimedShotDmgIncreaseNoTS += (this.timeIntoVulnerable * 0.06);
        //counts Patient Sniper Aimed WITHOUT Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper.zeroSecondsIntoVulnerableAimed += 1;
            break;
          case 1:
            this.patientSniper.oneSecondIntoVulnerableAimed += 1;
            break;
          case 2:
            this.patientSniper.twoSecondsIntoVulnerableAimed += 1;
            break;
          case 3:
            this.patientSniper.threeSecondsIntoVulnerableAimed += 1;
            break;
          case 4:
            this.patientSniper.fourSecondsIntoVulnerableAimed += 1;
            break;
          case 5:
            this.patientSniper.fiveSecondsIntoVulnerableAimed += 1;
            break;
          case 6:
            this.patientSniper.sixSecondsIntoVulnerableAimed += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper.nonVulnerableAimedShots += 1;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id && this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.aimedShotsWithTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor(((eventTimestamp - this.lastVulnerableTimestamp) / 1000));
        this.aimedShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Aimed WITH Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper.zeroSecondsIntoVulnerableAimedTS += 1;
            break;
          case 1:
            this.patientSniper.oneSecondIntoVulnerableAimedTS += 1;
            break;
          case 2:
            this.patientSniper.twoSecondsIntoVulnerableAimedTS += 1;
            break;
          case 3:
            this.patientSniper.threeSecondsIntoVulnerableAimedTS += 1;
            break;
          case 4:
            this.patientSniper.fourSecondsIntoVulnerableAimedTS += 1;
            break;
          case 5:
            this.patientSniper.fiveSecondsIntoVulnerableAimedTS += 1;
            break;
          case 6:
            this.patientSniper.sixSecondsIntoVulnerableAimedTS += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper.nonVulnerableAimedShotsTS += 1;
      }
    }

    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id && !this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.piercingShotsNoTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        this.piercingShotDmgIncreaseNoTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Piercing WITHOUT Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper.zeroSecondsIntoVulnerablePiercing += 1;
            break;
          case 1:
            this.patientSniper.oneSecondIntoVulnerablePiercing += 1;
            break;
          case 2:
            this.patientSniper.twoSecondsIntoVulnerablePiercing += 1;
            break;
          case 3:
            this.patientSniper.threeSecondsIntoVulnerablePiercing += 1;
            break;
          case 4:
            this.patientSniper.fourSecondsIntoVulnerablePiercing += 1;
            break;
          case 5:
            this.patientSniper.fiveSecondsIntoVulnerablePiercing += 1;
            this.piercingShotDmgIncreaseNoTS += this.timeIntoVulnerable * 0.06;
            break;
          case 6:
            this.patientSniper.sixSecondsIntoVulnerablePiercing += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper.nonVulnerablePiercingShots += 1;
      }
    }
    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id && this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.piercingShotsWithTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        this.piercingShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Piercing WITH Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper.zeroSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 1:
            this.patientSniper.oneSecondIntoVulnerablePiercingTS += 1;
            break;
          case 2:
            this.patientSniper.twoSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 3:
            this.patientSniper.threeSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 4:
            this.patientSniper.fourSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 5:
            this.patientSniper.fiveSecondsIntoVulnerablePiercingTS += 1;
            this.piercingShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
            break;
          case 6:
            this.patientSniper.sixSecondsIntoVulnerablePiercingTS += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper.nonVulnerablePiercingShotsTS += 1;
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
      if (this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
        this.totalVulnWindows += 1;
      } else {
        this.vulnWindowsNoTS += 1;
        this.totalVulnWindows += 1;
      }
    }
  }
}

export default PatientSniperTracker;

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

  //The various levels of patient sniper
/*
  patientSniperLevelsAimedShots = {
    nonVulnerableAimedShots: {
      amount: 0,
    },
    zeroSecondsIntoVulnerableAimed: {
      amount: 0,
    },
    oneSecondIntoVulnerableAimed: {
      amount: 0,
    },
    twoSecondsIntoVulnerableAimed: {
      amount: 0,
    },
    threeSecondsIntoVulnerableAimed: {
      amount: 0,
    },
    fourSecondsIntoVulnerableAimed: {
      amount: 0,
    },
    fiveSecondsIntoVulnerableAimed: {
      amount: 0,
    },
    sixSecondsIntoVulnerableAimed: {
      amount: 0,
    },
  };

  patientSniperLevelsPiercingShots = {

  };
*//*
  vulnerableGenerators = {
    [SPELLS.WINDBURST.id]: 0,
    [SPELLS.MARKED_SHOT.id]: 0,
  };

  shotsAffectByVulnerable = {
    [SPELLS.AIMED_SHOT.id]: 0,
    [SPELLS.SPELLS.PIERCING_SHOT_TALENT.id]: 0,
  };
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
      aimedShotsNoTS: 0,
      aimedShotsWithTS: 0,
      vulnerableModifierAimed: 0.3,
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
      piercingShotsNoTS: 0,
      piercingShotsWithTS: 0,
      vulnerableModifierPiercing: 0.3,
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

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
    const unerringArrowsRank = this.combatants.selected.traitsBySpellId[SPELLS.UNERRING_ARROWS_TRAIT.id];
    this.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed += unerringArrowsRank * 0.03;
    this.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing += unerringArrowsRank * 0.03;
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
      this.patientSniper[spellId].aimedShotsNoTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor(((eventTimestamp - this.lastVulnerableTimestamp) / 1000));
        this.aimedShotDmgIncreaseNoTS += (this.timeIntoVulnerable * 0.06);
        //counts Patient Sniper Aimed WITHOUT Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper[spellId].zeroSecondsIntoVulnerableAimed += 1;
            break;
          case 1:
            this.patientSniper[spellId].oneSecondIntoVulnerableAimed += 1;
            break;
          case 2:
            this.patientSniper[spellId].twoSecondsIntoVulnerableAimed += 1;
            break;
          case 3:
            this.patientSniper[spellId].threeSecondsIntoVulnerableAimed += 1;
            break;
          case 4:
            this.patientSniper[spellId].fourSecondsIntoVulnerableAimed += 1;
            break;
          case 5:
            this.patientSniper[spellId].fiveSecondsIntoVulnerableAimed += 1;
            break;
          case 6:
            this.patientSniper[spellId].sixSecondsIntoVulnerableAimed += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper[spellId].nonVulnerableAimedShots += 1;
      }
    }
    if (spellId === SPELLS.AIMED_SHOT.id && this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.patientSniper[spellId].aimedShotsWithTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor(((eventTimestamp - this.lastVulnerableTimestamp) / 1000));
        this.aimedShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Aimed WITH Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper[spellId].zeroSecondsIntoVulnerableAimedTS += 1;
            break;
          case 1:
            this.patientSniper[spellId].oneSecondIntoVulnerableAimedTS += 1;
            break;
          case 2:
            this.patientSniper[spellId].twoSecondsIntoVulnerableAimedTS += 1;
            break;
          case 3:
            this.patientSniper[spellId].threeSecondsIntoVulnerableAimedTS += 1;
            break;
          case 4:
            this.patientSniper[spellId].fourSecondsIntoVulnerableAimedTS += 1;
            break;
          case 5:
            this.patientSniper[spellId].fiveSecondsIntoVulnerableAimedTS += 1;
            break;
          case 6:
            this.patientSniper[spellId].sixSecondsIntoVulnerableAimedTS += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper[spellId].nonVulnerableAimedShotsTS += 1;
      }
    }

    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id && !this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.patientSniper[spellId].piercingShotsNoTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        this.piercingShotDmgIncreaseNoTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Piercing WITHOUT Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper[spellId].zeroSecondsIntoVulnerablePiercing += 1;
            break;
          case 1:
            this.patientSniper[spellId].oneSecondIntoVulnerablePiercing += 1;
            break;
          case 2:
            this.patientSniper[spellId].twoSecondsIntoVulnerablePiercing += 1;
            break;
          case 3:
            this.patientSniper[spellId].threeSecondsIntoVulnerablePiercing += 1;
            break;
          case 4:
            this.patientSniper[spellId].fourSecondsIntoVulnerablePiercing += 1;
            break;
          case 5:
            this.patientSniper[spellId].fiveSecondsIntoVulnerablePiercing += 1;
            this.piercingShotDmgIncreaseNoTS += this.timeIntoVulnerable * 0.06;
            break;
          case 6:
            this.patientSniper[spellId].sixSecondsIntoVulnerablePiercing += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper[spellId].nonVulnerablePiercingShots += 1;
      }
    }
    if (spellId === SPELLS.PIERCING_SHOT_TALENT.id && this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id)) {
      this.patientSniper[spellId].piercingShotsWithTS += 1;
      if (enemy.hasBuff(SPELLS.VULNERABLE.id, eventTimestamp)) {
        this.timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
        this.piercingShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
        //counts Patient Sniper Piercing WITH Trueshot
        switch (this.timeIntoVulnerable) {
          case 0:
            this.patientSniper[spellId].zeroSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 1:
            this.patientSniper[spellId].oneSecondIntoVulnerablePiercingTS += 1;
            break;
          case 2:
            this.patientSniper[spellId].twoSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 3:
            this.patientSniper[spellId].threeSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 4:
            this.patientSniper[spellId].fourSecondsIntoVulnerablePiercingTS += 1;
            break;
          case 5:
            this.patientSniper[spellId].fiveSecondsIntoVulnerablePiercingTS += 1;
            this.piercingShotDmgIncreaseWithTS += this.timeIntoVulnerable * 0.06;
            break;
          case 6:
            this.patientSniper[spellId].sixSecondsIntoVulnerablePiercingTS += 1;
            break;
          default:
            break;
        }
      } else {
        this.patientSniper[spellId].nonVulnerablePiercingShotsTS += 1;
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

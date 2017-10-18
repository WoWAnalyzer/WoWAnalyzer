import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import getDamageBonus from '../../Core/getDamageBonus';

const PATIENT_SNIPER_BONUS_PER_SEC = 0.06;

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
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
        },
        count: 0,
      },
      TS: {
        noVulnerable: 0,
        seconds: {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
        },
        count: 0,
      },
    },
    [SPELLS.PIERCING_SHOT_TALENT.id]: {
      bonusDmg: 0,
      noTS: {
        noVulnerable: 0,
        seconds: {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
        },
        count: 0,
      },
      TS: {
        noVulnerable: 0,
        seconds: {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
        },
        count: 0,
      },
    },
  };

  lastVulnerableTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.VULNERABLE.id) {
      return;
    }
    this.lastVulnerableTimestamp = event.timestamp;
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
    const hasVulnerability = enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp);

    // Vulnerable is taken care of in apply/refreshdebuff
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }

    const timeIntoVulnerable = Math.floor((eventTimestamp - this.lastVulnerableTimestamp) / 1000);
    if (hasTS) {
      this.patientSniper[spellId].TS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].TS.seconds[timeIntoVulnerable] += 1;
      }
      else {
        this.patientSniper[spellId].TS.noVulnerable += 1;
      }
    }
    else {
      this.patientSniper[spellId].noTS.count += 1;
      if (hasVulnerability) {
        this.patientSniper[spellId].noTS.seconds[timeIntoVulnerable] += 1;
      }
      else {
        this.patientSniper[spellId].noTS.noVulnerable += 1;
      }
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id && spellId !== SPELLS.PIERCING_SHOT_TALENT.id) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.VULNERABLE.id, event.timestamp)) {
      return;
    }
    const timeIntoVulnerable = Math.floor((event.timestamp - this.lastVulnerableTimestamp) / 1000);
    this.patientSniper[spellId].bonusDmg += getDamageBonus(event, timeIntoVulnerable * PATIENT_SNIPER_BONUS_PER_SEC);
  }
}

export default PatientSniperTracker;

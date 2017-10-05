import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class PatientSniper extends Module {
  static dependencies = {
    enemies: Enemies,
  };
  oneSecondIntoVulnerable = 0;
  twoSecondsIntoVulnerable = 0;
  threeSecondsIntoVulnerable = 0;
  fourSecondsIntoVulnerable = 0;
  fiveSecondsIntoVulnerable = 0;
  sixSecondsIntoVulnerable = 0;

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
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const enemy = this.enemies.getEntity(event);
    if(!enemy.hasBuff(SPELLS.VULNERABLE.id)) {
      return;
    }
    if(enemy.refreshBuff(SPELLS.VULNERABLE.id)) {

    }

  }

}

export default PatientSniper;

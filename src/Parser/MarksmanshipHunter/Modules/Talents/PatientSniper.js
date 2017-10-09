import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from "../../../Core/Modules/Combatants";

class PatientSniper extends Module {

  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  }

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
  zeroSecondsIntoVulnerable = 0;
  oneSecondIntoVulnerable = 0;
  twoSecondsIntoVulnerable = 0;
  threeSecondsIntoVulnerable = 0;
  fourSecondsIntoVulnerable = 0;
  fiveSecondsIntoVulnerable = 0;
  sixSecondsIntoVulnerable = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    const enemy = this.enemies.getEntity(event);

    if (spellId !== SPELLS.WINDBURST.id || spellId !== SPELLS.MARKED_SHOT.id) {
      return;
    }

  }

}

export default PatientSniper;

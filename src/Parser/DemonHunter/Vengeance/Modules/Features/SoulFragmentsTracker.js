import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';

class SoulFragmentsTracker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };


  soulsGenerated = 0;
  soulsWasted = 0;
  soulsSpent = 0;
  currentSouls = 0;

  soulsConsumedBySpell = [];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT.id) {
      this.soulsGenerated += 1;
      if (this.currentSouls < 5) {
        this.currentSouls += 1;
      } else {
        this.soulsWasted += 1;
      }
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT_STACK.id) {
      this.soulsSpent += 1;
      this.currentSouls -= 1;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SOUL_FRAGMENT_STACK.id) {
      this.soulsSpent += 1;
      this.currentSouls -= 1;
    }
  }
}

export default SoulFragmentsTracker;

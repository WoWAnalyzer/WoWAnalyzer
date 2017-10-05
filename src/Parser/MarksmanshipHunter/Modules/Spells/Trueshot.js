//import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class QuickShot extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  trueShotCDReduction = 0;
  totalFromCD = 0;

  get tsAvailableCasts() {
    const player = this.combatants.selected;
    const quickShotRank = player.traitsBySpellId[SPELLS.QUICK_SHOT_TRAIT.id];

    if (quickShotRank === 0) {
      return;
    }
    else if (quickShotRank > 0 && quickShotRank < 4) {
      this.trueShotCDReduction = quickShotRank * 10;
    } else if (quickShotRank === 4) {
      this.trueShotCDReduction = 38;
    }
    else if (quickShotRank === 5) {
      this.trueShotCDReduction = 45;
    }
    else if (quickShotRank === 6) {
      this.trueShotCDReduction = 52;
    }
    else if (quickShotRank === 7) {
      this.trueShotCDReduction = 58;
    }
    const cooldownWithTraits = 180 - this.trueShotCDReduction;
    this.totalFromCD = (this.owner.fightDuration / 1000) / cooldownWithTraits;
   const tsAvailableCasts = this.totalFromCD;
    return tsAvailableCasts;
  }
}

export default QuickShot;

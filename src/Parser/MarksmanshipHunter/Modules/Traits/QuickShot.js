import React from 'react';

import SPELLS from 'common/SPELLS';


import Module from 'Parser/Core/Module';


class QuickShot extends Module {

  trueShotCDReduction = 0;

  on_initialized() {
    const player = this.combatants.selected;
    const quickShotRank = player.traitsBySpellId[SPELLS.QUICK_SHOT_TRAIT.id];

    if (quickShotRank === 0) {
      return;
    }
    else if (quickShotRank>0 && quickShotRank<4)
    {
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
  }
}

export default QuickShot;

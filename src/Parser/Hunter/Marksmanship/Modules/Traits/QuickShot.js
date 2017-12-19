import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

/*
 * Reduces the cooldown of Trueshot by 10 sec. (has diminished returns)
 */

class QuickShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.QUICK_SHOT_TRAIT.id];
  }
  trueShotCDReduction = 0;

  get traitCooldownReduction() {
    const player = this.combatants.selected;
    const quickShotRank = player.traitsBySpellId[SPELLS.QUICK_SHOT_TRAIT.id];

    //Calculates the reduction in cooldown on Trueshot, based upon the rank of the trait Quick Shot. Each rank gives diminishing values, the more ranks you get. Rank 1-3 is 10 each, then each switch case is for the subsequential 4 possibilities.
    if (quickShotRank < 4) {
      this.trueShotCDReduction = quickShotRank * 10;
    }
    else {
      switch (quickShotRank) {
        case 4:
          this.trueShotCDReduction = 38;
          break;
        case 5:
          this.trueShotCDReduction = 45;
          break;
        case 6:
          this.trueShotCDReduction = 52;
          break;
        case 7:
          this.trueShotCDReduction = 58;
          break;
        default:
          break;
      }
    }
    const cdReduction = this.trueShotCDReduction;
    return cdReduction;
  }
}

export default QuickShot;

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

// Master Assassin: Reduces the cooldown of Vendetta by 10 sec. (Has dimishing returns past rank 3.)

class MasterAssassin extends Analyzer {
    static dependencies = {
        combatants: Combatants,
    };

  on_initialized() {
      this.active = this.combatants.selected.traitsBySpellId[SPELLS.MASTER_ASSASSIN.id] > 0;
  }

  get traitCooldownReduction() {
    const rank = this.combatants.selected.traitsBySpellId[SPELLS.MASTER_ASSASSIN.id];
    let cdReduction = 0;

    if (rank < 4) {
      cdReduction = rank * 10;
    }
    else {
      switch (rank) {
        case 4:
          cdReduction = 38;
          break;
        case 5:
          cdReduction = 44;
          break;
        case 6:
          cdReduction = 48;
          break;
        case 7:
          cdReduction = 52;
          break;
        default:
          break;
      }
    }
    return cdReduction;
  }
}

export default MasterAssassin;

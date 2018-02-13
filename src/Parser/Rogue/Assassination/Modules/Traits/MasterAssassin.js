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

  vendettaCDReduction = 0;

  get traitCooldownReduction() {
      const rank = this.combatants.selected.traitsBySpellId[SPELLS.MASTER_ASSASSIN.id];

      if (rank < 4) {
        this.vendettaCDReduction = rank * 10;
      }
      else {
        switch (rank) {
            case 4:
              this.vendettaCDReduction = 38;
              break;
            case 5:
              this.vendettaCDReduction = 44;
              break;
            case 6:
              this.vendettaCDReduction = 48;
              break;
            case 7:
              this.vendettaCDReduction = 52;
              break;
            default:
              break;
        }
      }
    const cdReduction = this.vendettaCDReduction;
    return cdReduction;
  }
}

export default MasterAssassin;

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

const ASCENDANCE_BUFF_TIMER = 15;
const ASCENDANCE_SH = 10;

class SmolderingHeart extends Module {
  procsSH = 0;
  damageSH = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasHands(ITEMS.SMOLDERING_HEART.id);
    }
  }


}

export default SmolderingHeart;

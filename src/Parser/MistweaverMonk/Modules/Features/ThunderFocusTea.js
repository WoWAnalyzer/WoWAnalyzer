import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = true;

class ThunderFocusTea extends Module {

    castsTftEff = 0;
    castsTftViv = 0;
    castsTftEnm = 0;
    castsTftViv = 0;


    on_toPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if(SPELLS.THUNDER_FOCUS_TEA.id === spellId) {
        this.castsTft++;
      }
    }

    on_byPlayer_cast(event) {
      const spellId = event.ability.guid;

      if(this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {

      }
      
    }

    on_finished() {
      if(debug) {
        console.log("TFT Casts:" + this.castsTft);
      }
    }

}

export default ManaSavingTalents;

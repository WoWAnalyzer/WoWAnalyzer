import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class ThunderFocusTea extends Module {

    castsTftEff = 0;
    castsTftEf = 0;
    castsTftViv = 0;
    castsTftEnm = 0;
    castsTftRem = 0;

    castsTft = 0;
    castsUnderTft = 0;

    TftVivCastTimestamp = null;

    on_toPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if(SPELLS.THUNDER_FOCUS_TEA.id === spellId) {
        this.castsTft++;
      }
    }

    on_byPlayer_cast(event) {
      const spellId = event.ability.guid;

      // Implemented as a way to remove non-buffed REM casts that occur at the same timestamp as the buffed Viv cast.
      // Need to think of cleaner solution
      if(this.TftVivCastTimestamp === event.timestamp) {
        return;
      }

      if(this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
        if(SPELLS.VIVIFY.id === spellId && !event.classResources.cost) {
          this.castsUnderTft++;
          this.castsTftViv++;
          debug && console.log('Viv TFT Check');
          this.TftVivCastTimestamp = event.timestamp;
        }
        if(SPELLS.EFFUSE.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEff++;
          debug && console.log('Eff TFT Check');
        }
        if(SPELLS.ENVELOPING_MISTS.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEnm++;
          debug && console.log('Enm TFT Check');
        }
        if(SPELLS.ESSENCE_FONT.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEf++;
          debug && console.log('EF TFT Check');
        }
        if(SPELLS.RENEWING_MIST.id === spellId) {
          this.castsUnderTft++;
          this.castsTftRem++;
          debug && console.log('REM TFT Check');
        }


      }

    }

    on_finished() {
      if(debug) {
        console.log("TFT Casts:" + this.castsTft);
        console.log("Eff Buffed:" + this.castsTftEff);
        console.log("Enm Buffed:" + this.castsTftEnm);
        console.log("EF Buffed:" + this.castsTftEf);
        console.log("Viv Buffed:" + this.castsTftViv);
        console.log("REM Buffed:" + this.castsTftRem);
      }
    }

}

export default ThunderFocusTea;

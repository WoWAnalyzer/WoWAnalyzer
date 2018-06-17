import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../Core/SharedBrews';

const KEG_SMASH_REDUCTION = 4000;
const BOC_KEG_SMASH_REDUCTION = 2000;

class KegSmash extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    boc: BlackoutCombo,
    brews: SharedBrews,
  };

  totalCasts = 0;
  bocHits = 0;

  cdr = 0;
  bocCDR = 0;
  wastedCDR = 0;
  wastedBocCDR = 0;

  _bocBuffActive = false;
  
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._bocBuffActive = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._bocBuffActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this._bocBuffActive = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(SPELLS.KEG_SMASH.id !== spellId) {
      return;
    }
    this.totalCasts += 1;

    const actualReduction = this.brews.reduceCooldown(KEG_SMASH_REDUCTION);
    this.cdr += actualReduction;
    this.wastedCDR += KEG_SMASH_REDUCTION - actualReduction;

    if(this._bocBuffActive) {
      this.bocHits += 1; // assuming (not a big assumption) that we get ≥ 1 hit per cast

      // possible for minor loss of correctness due to potential gap
      // between cast and hit, but even on long fights this won't
      // amount to much
      const actualBocReduction = this.brews.reduceCooldown(BOC_KEG_SMASH_REDUCTION);
      this.bocCDR += actualBocReduction;
      this.wastedBocCDR += BOC_KEG_SMASH_REDUCTION - actualBocReduction;
    }
  }

}

export default KegSmash;

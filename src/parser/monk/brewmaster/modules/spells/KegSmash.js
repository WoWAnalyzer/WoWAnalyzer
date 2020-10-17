import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../core/SharedBrews';
import Events from 'parser/core/Events';

const KEG_SMASH_REDUCTION = 3000;
const BOC_KEG_SMASH_REDUCTION = 2000;

class KegSmash extends Analyzer {
  static dependencies = {
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

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onLoseBOC);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KEG_SMASH), this.onCast);
  }

  onGainBOC(event){
    this._bocBuffActive = true;
  }

  onLoseBOC(event){
    this._bocBuffActive = false;
  }

  onCast(event) {
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

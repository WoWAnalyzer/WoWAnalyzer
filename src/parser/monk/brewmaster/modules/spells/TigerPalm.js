import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../core/SharedBrews';
import Events from 'parser/core/Events';

const TIGER_PALM_REDUCTION = 1000;

class TigerPalm extends Analyzer {
  static dependencies = {
    boc: BlackoutCombo,
    brews: SharedBrews,
    statTracker: StatTracker,
  };

  totalCasts = 0;
  normalHits = 0;
  bocHits = 0;
  lastAttackPower = 0;

  cdr = 0;
  wastedCDR = 0;

  bocBuffActive = false;
  bocApplyToTP = false;

  get totalBocHits() {
    return this.bocHits;
  }

  get bocEmpoweredThreshold() {
    if(!this.selectedCombatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id)) {
      return null;
    }
    return {
      actual: this.totalBocHits / this.totalCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onGainBOC);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onLoseBOC);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onDamage);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.onDamageTaken);
  }

  onGainBOC(event){
    this._bocBuffActive = true;
  }

  onLoseBOC(event){
    this._bocBuffActive = false;
  }

  onCast(event) {
    this.totalCasts += 1;
    this.bocApplyToTP = this.bocBuffActive;
  }

  onDamage(event) {
    // OK SO we have a hit, lets reduce the CD by the base amount...
    const actualReduction = this.brews.reduceCooldown(TIGER_PALM_REDUCTION);
    this.cdr += actualReduction;
    this.wastedCDR += TIGER_PALM_REDUCTION - actualReduction;

    if (this.bocApplyToTP) {
      this.bocHits += 1;
    } else {
      this.normalHits += 1;
    }
  }

  onDamageTaken(event) {
    // record the last known AP to estimate the amount of damage a
    // non-FP TP should do
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }
}

export default TigerPalm;

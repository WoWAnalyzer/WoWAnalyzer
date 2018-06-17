import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import BlackoutCombo from './BlackoutCombo';
import SharedBrews from '../Core/SharedBrews';

const TIGER_PALM_REDUCTION = 1000;

class TigerPalm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
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
    if(!this.combatants.selected.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id)) {
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

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = true;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      this.bocBuffActive = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TIGER_PALM.id === spellId) {
      this.totalCasts += 1;
      this.bocApplyToTP = this.bocBuffActive;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TIGER_PALM.id === spellId) {
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
  }

  on_toPlayer_damage(event) {
    // record the last known AP to estimate the amount of damage a
    // non-FP TP should do
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }
}

export default TigerPalm;

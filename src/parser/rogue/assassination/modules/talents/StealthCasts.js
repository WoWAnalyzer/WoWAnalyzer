import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class StealthCasts extends Analyzer {

  stealthSequences = [];
  latestStealth = null;
  usedStealthOnPull = false;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.evaluateCast);
  }

  evaluateCast(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.SUBTERFUGE_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSIN_BUFF.id)) {
      if (this.latestStealth) {
        if (this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id)) {
          this.usedStealthOnPull = true;
        }
        this.latestStealth = null;
      }
      return;
    }
    if (!this.latestStealth) {
      this.latestStealth = [];
      this.stealthSequences.push(this.latestStealth);
    }
    this.latestStealth.push(event);
  }

}

export default StealthCasts;

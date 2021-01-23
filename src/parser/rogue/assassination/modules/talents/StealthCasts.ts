import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

const STEALTH_CHECK_BUFFER_MS = 50;

class StealthCasts extends Analyzer {

  stealthSequences: CastEvent[][] = [];
  latestStealth: CastEvent[] = [];
  usedStealthOnPull = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.evaluateCast);
  }

  evaluateCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id, null, STEALTH_CHECK_BUFFER_MS) ||
      this.selectedCombatant.hasBuff(SPELLS.STEALTH.id, null, STEALTH_CHECK_BUFFER_MS)) {
      this.usedStealthOnPull = true;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.STEALTH.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.SUBTERFUGE_BUFF.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSIN_BUFF.id)) {

      if (this.latestStealth) {
        this.latestStealth = [];
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

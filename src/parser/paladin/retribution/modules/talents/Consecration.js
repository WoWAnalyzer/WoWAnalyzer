import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

class Consecration extends Analyzer {
  static dependencies = {
  };

  wasteHP = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CONSECRATION_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_TALENT), this.onConsecrationCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_TALENT), this.onConsecrationEnergize);
  }

  onConsecrationEnergize(event) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onConsecrationCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Consecration was cast while at max HP. Make sure to use a HP spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default Consecration;

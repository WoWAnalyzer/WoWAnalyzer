import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

class BladeofJustice extends Analyzer {
  static dependencies = {
  };

  wasteHP = false;
  waste2HP = false;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_JUSTICE), this.onBladeofJusticeCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_JUSTICE), this.onBladeofJusticeEnergize);
  }

  onBladeofJusticeEnergize(event) {
    if (event.waste === 1) {
      this.wasteHP = true;
    }
    if (event.waste === 2) {
      this.waste2HP = true;
    }
  }

  onBladeofJusticeCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Blade of Justice was cast while at 4HP. Make sure to either use a 1HP generator or HP spender first to avoid overcapping.';
      this.wasteHP = false;
    }
    if (this.waste2HP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Blade of Justice was cast while at max HP. Make sure to use a HP spender first to avoid overcapping.';
      this.waste2HP = false;
    }
  }
}

export default BladeofJustice;

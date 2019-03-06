import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';


class CrusaderStrike extends Analyzer {
  static dependencies = {
  };

  wasteHP = false;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE), this.onCrusaderStrikeCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE), this.onCrusaderStrikeEnergize);
  }

  onCrusaderStrikeEnergize(event) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onCrusaderStrikeCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Crusader Strike was cast while at max HP. Make sure to use a HP spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default CrusaderStrike;

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {EnergizeEvent, CastEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

class CrusaderStrike extends Analyzer {

  wasteHP = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE), this.onCrusaderStrikeCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE), this.onCrusaderStrikeEnergize);
  }

  onCrusaderStrikeEnergize(event: EnergizeEvent) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onCrusaderStrikeCast(event: CastEvent) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Crusader Strike was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default CrusaderStrike;

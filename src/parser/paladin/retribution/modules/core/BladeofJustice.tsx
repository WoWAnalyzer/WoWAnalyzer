import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {EnergizeEvent, CastEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

class BladeofJustice extends Analyzer {

  wastedHP = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_JUSTICE), this.onBladeOfJusticeCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_JUSTICE), this.onBladeOfJusticeEnergize);
  }

  onBladeOfJusticeEnergize(event: EnergizeEvent) {
    if (event.waste > 0) {
      this.wastedHP = event.waste;
    }
  }

  onBladeOfJusticeCast(event: CastEvent) {
    if (this.wastedHP > 0) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Blade of Justice was cast while at ${this.wastedHP === 1 ? '4 Holy Power' : 'max Holy Power'}. Make sure to either use a ${this.wastedHP === 1 ? '1 Holy Power Generator or' : ''} Holy Power spender first to avoid overcapping.`;
      this.wastedHP = 0;
    }
  }
}

export default BladeofJustice;

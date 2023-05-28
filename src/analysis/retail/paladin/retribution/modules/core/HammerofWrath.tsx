import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, CastEvent } from 'parser/core/Events';

// TODO: Needs updating with ExecuteHelper

class HammerofWrath extends Analyzer {
  wasteHP = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH),
      this.onHammerofWrathCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH),
      this.onHammerofWrathEnergize,
    );
  }

  onHammerofWrathEnergize(event: ResourceChangeEvent) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onHammerofWrathCast(event: CastEvent) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason =
        'Hammer of Wrath was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default HammerofWrath;

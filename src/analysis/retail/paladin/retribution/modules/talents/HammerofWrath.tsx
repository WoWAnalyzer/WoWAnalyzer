import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

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
      addInefficientCastReason(
        event,
        'Hammer of Wrath was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.',
      );
      this.wasteHP = false;
    }
  }
}

export default HammerofWrath;

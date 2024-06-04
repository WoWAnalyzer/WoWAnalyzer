import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

class CrusaderStrike extends Analyzer {
  wasteHP = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCrusaderStrikeCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCrusaderStrikeEnergize,
    );
  }

  onCrusaderStrikeEnergize(event: ResourceChangeEvent) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onCrusaderStrikeCast(event: CastEvent) {
    if (this.wasteHP) {
      addInefficientCastReason(
        event,
        'Crusader Strike was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.',
      );
      this.wasteHP = false;
    }
  }
}

export default CrusaderStrike;

import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

import HammerofWrath from '../../../shared/spells/HammerOfWrath'

class HammerofWrathRetribution extends HammerofWrath {

  wasteHP = false;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH), this.onHammerofWrathCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH), this.onHammerofWrathEnergize);
  }

  onHammerofWrathEnergize(event) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onHammerofWrathCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Hammer of Wrath was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }
}

export default HammerofWrathRetribution;

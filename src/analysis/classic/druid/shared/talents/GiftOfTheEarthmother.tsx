import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { AnyEvent } from 'parser/core/Events';
import Haste from '../Haste';

/**
 * 5/5 Gift of the Earthmother (GOTE) talent adds 10% spell haste
 */

class GiftOfTheEarthmother extends Analyzer {
  static dependencies = {
    haste: Haste,
  };
  protected haste!: Haste;

  goteHaste: number = 0.1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.talentPoints[2] >= 50;
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.any, this.addGotEHaste);
  }

  addGotEHaste(event: AnyEvent) {
    const newHaste = this.haste.current + this.goteHaste;
    this.haste._setHaste(event, newHaste);
    this.active = false;
  }
}

export default GiftOfTheEarthmother;

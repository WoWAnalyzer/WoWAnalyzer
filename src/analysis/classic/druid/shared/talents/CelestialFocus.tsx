import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { MappedEvent } from 'parser/core/Events';
import Haste from '../Haste';

/**
 * 3/3 Celestial Focus (CF) talent adds 3% spell haste
 */

class CelestialFocus extends Analyzer {
  static dependencies = {
    haste: Haste,
  };
  protected haste!: Haste;

  cfHaste: number = 0.03;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.talentPoints[0] >= 18;
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.any, this.addCFHaste);
  }

  addCFHaste(event: MappedEvent) {
    const newHaste = this.haste.current + this.cfHaste;
    this.haste._setHaste(event, newHaste);
    this.active = false;
  }
}

export default CelestialFocus;

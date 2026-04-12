import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { AnyEvent } from 'parser/core/Events';
import Haste from '../Haste';

// TODO: Update for MoP Classic (spell 84738). Currently hardcoded disabled.

/**
 * 3/3 Celestial Focus (CF) talent adds 3% spell haste
 */

class CelestialFocus extends Analyzer {
  static dependencies = {
    haste: Haste,
  };
  protected haste!: Haste;

  cfHaste = 0.03;

  constructor(options: Options) {
    super(options);
    // NOTE: Hardcoded disabled until updated for MoP Classic
    this.active = false;
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.any, this.addCFHaste);
  }

  addCFHaste(event: AnyEvent) {
    const newHaste = this.haste.current + this.cfHaste;
    this.haste._setHaste(event, newHaste);
    this.active = false;
  }
}

export default CelestialFocus;

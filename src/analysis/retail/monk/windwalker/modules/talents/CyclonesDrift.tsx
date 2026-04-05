import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

class CyclonesDrift extends Analyzer.withDependencies({
  statTracker: StatTracker,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CYCLONES_DRIFT_TALENT);
    if (!this.active) {
      return;
    }

    // Cyclone's Drift scales haste from rating and future haste-giving stat effects.
    this.deps.statTracker.addStatMultiplier({ haste: 1.1 }, false, 'CyclonesDrift');
  }
}

export default CyclonesDrift;

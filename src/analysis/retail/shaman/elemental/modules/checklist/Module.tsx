import { FlameShock } from 'analysis/retail/shaman/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import Component from '../checklist/Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import CancelledCasts from '../features/CancelledCasts';
import Ascendance from '../talents/Ascendance';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    ascendance: Ascendance,
    flameshock: FlameShock,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected cancelledCasts!: CancelledCasts;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected ascendance!: Ascendance;
  protected flameshock!: FlameShock;

  render() {
    return (
      <Component
        combatant={this.selectedCombatant}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          cancelledCasts: this.cancelledCasts.cancelledCastSuggestionThresholds,
          downtime: this.alwaysBeCasting.downtimeSuggestionThresholds,
          ascendanceEfficiency: this.ascendance.suggestionThresholds,
          flameShockUptime: this.flameshock.uptimeThreshold,
          flameShockRefreshes: this.flameshock.refreshThreshold,
        }}
      />
    );
  }
}

export default Checklist;

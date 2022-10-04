import { ComboPointDetails, EnergyCapTracker, EnergyDetails } from 'analysis/retail/rogue/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import EarlyDotRefresh from '../../spells/EarlyDotRefresh';
import GarroteUptime from '../../spells/GarroteUptime';
import RuptureUptime from '../../spells/RuptureUptime';
import Blindside from '../../talents/Blindside';
import MasterAssassin from '../../talents/MasterAssassin';
import Nightstalker from '../../talents/Nightstalker';
import Subterfuge from '../../talents/Subterfuge';
import GarroteSnapshot from '../GarroteSnapshot';
import RuptureSnapshot from '../RuptureSnapshot';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    garroteUptime: GarroteUptime,
    ruptureUptime: RuptureUptime,
    earlyDotRefresh: EarlyDotRefresh,

    blindside: Blindside,

    energyDetails: EnergyDetails,
    energyCapTracker: EnergyCapTracker,
    comboPointDetails: ComboPointDetails,

    subterfuge: Subterfuge,
    nightstalker: Nightstalker,
    masterAssassin: MasterAssassin,
    garroteSnapshot: GarroteSnapshot,
    ruptureSnapshot: RuptureSnapshot,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          garroteUptime: this.garroteUptime.suggestionThresholds,
          ruptureUptime: this.ruptureUptime.suggestionThresholds,
          garroteEfficiency: this.earlyDotRefresh.suggestionThresholdsGarroteEfficiency,
          ruptureEfficiency: this.earlyDotRefresh.suggestionThresholdsRuptureEfficiency,

          blindsideEfficiency: this.blindside.suggestionThresholds,

          energyEfficiency: this.energyDetails.suggestionThresholds,
          energyCapEfficiency: this.energyCapTracker.suggestionThresholds,
          comboPointEfficiency: this.comboPointDetails.suggestionThresholds,

          subterfugeEfficiency: this.subterfuge.suggestionThresholds,
          nightstalkerEfficiency: this.nightstalker.suggestionThresholds,
          nightstalkerOpenerEfficiency: this.nightstalker.suggestionThresholdsOpener,
          masterAssassinEfficiency: this.masterAssassin.suggestionThresholds,
          ruptureSnapshotEfficiency: this.ruptureSnapshot.suggestionThresholds,
          garroteSnapshotEfficiency: this.garroteSnapshot.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;

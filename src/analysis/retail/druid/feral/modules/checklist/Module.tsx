import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import RakeUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RipUptimeAndSnapshots';
import ComboPointDetails from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointDetails';
import FinisherUse from 'analysis/retail/druid/feral/modules/features/FinisherUse';
import AdaptiveSwarmFeral from 'analysis/retail/druid/feral/modules/spells/AdaptiveSwarmFeral';
import FerociousBite from 'analysis/retail/druid/feral/modules/spells/FerociousBite';
import TigersFuryEnergy from 'analysis/retail/druid/feral/modules/spells/TigersFuryEnergy';
import Bloodtalons from 'analysis/retail/druid/feral/modules/spells/Bloodtalons';
import MoonfireUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/MoonfireUptimeAndSnapshots';
import Component from 'analysis/retail/druid/feral/modules/checklist/Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    rakeUptime: RakeUptimeAndSnapshots,
    moonfireUptime: MoonfireUptimeAndSnapshots,
    adaptiveSwarm: AdaptiveSwarmFeral,
    comboPointDetails: ComboPointDetails,
    ripUptime: RipUptimeAndSnapshots,
    ferociousBite: FerociousBite,
    bloodtalons: Bloodtalons,
    tigersFuryEnergy: TigersFuryEnergy,
    finisherUse: FinisherUse,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  protected rakeUptime!: RakeUptimeAndSnapshots;
  protected moonfireUptime!: MoonfireUptimeAndSnapshots;
  protected adaptiveSwarm!: AdaptiveSwarmFeral;
  protected comboPointDetails!: ComboPointDetails;
  protected ripUptime!: RipUptimeAndSnapshots;
  protected ferociousBite!: FerociousBite;
  protected bloodtalons!: Bloodtalons;
  protected tigersFuryEnergy!: TigersFuryEnergy;
  protected finisherUse!: FinisherUse;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          // be prepared
          ...this.preparationRuleAnalyzer.thresholds,

          // uptimes
          ripUptime: this.ripUptime.suggestionThresholds,
          rakeUptime: this.rakeUptime.suggestionThresholds,
          moonfireUptime: this.moonfireUptime.suggestionThresholds,
          adaptiveSwarmUptime: this.adaptiveSwarm.suggestionThresholds,

          // snapshots
          ripTfSnapshot: this.ripUptime.tigersFurySnapshotThresholds,
          ripBtSnapshot: this.ripUptime.bloodTalonsSnapshotThresholds,
          rakeTfSnapshot: this.rakeUptime.tigersFurySnapshotThresholds,
          moonfireTfSnapshot: this.moonfireUptime.tigersFurySnapshotThresholds,
          prowlRakeLost: this.rakeUptime.prowlLostThresholds,

          // finishers
          ferociousBiteEnergy: this.ferociousBite.extraEnergySuggestionThresholds,
          badLowComboFinishers: this.finisherUse.badFinishersThresholds,
          ripDurationReduction: this.ripUptime.earlyRefreshThresholds,
          ferociousBiteBloodtalons: this.bloodtalons.correctFbSuggestionThresholds,
          // (Apex bite usage ??? or just a suggestion?)

          // spend your resources
          tigersFuryEnergy: this.tigersFuryEnergy.suggestionThresholds,
          comboPointsWaste: this.comboPointDetails.wastingSuggestionThresholds,

          // TODO combo builders section ??
        }}
      />
    );
  }
}

export default Checklist;

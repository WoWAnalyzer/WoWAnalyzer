import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.COMBO_POINTS;
    this.maxResource =
      5 +
      this.selectedCombatant.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT) +
      this.selectedCombatant.getTalentRank(TALENTS.SECRET_STRATAGEM_TALENT) +
      this.selectedCombatant.getTalentRank(TALENTS.DEVIOUS_STRATAGEM_TALENT);
    this.refundOnMiss = true;
    this.refundOnMissAmount = 1;
  }
}

export default ComboPointTracker;

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';
import Events, { ResourceChangeEvent } from 'parser/core/Events';

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
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);
  }

  onResourceChange(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if (this.current !== this.maxResource) {
      this._applyBuilder(event.ability.guid, event.resourceChange, event.waste, event.timestamp);
      this.log('Build: ' + this.current);
    }
  }
}

export default ComboPointTracker;

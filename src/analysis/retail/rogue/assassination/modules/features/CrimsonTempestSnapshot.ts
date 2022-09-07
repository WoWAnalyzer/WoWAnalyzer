import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';

import Snapshot from '../core/Snapshot';

const BASE_DURATION = 2000;
const COMBO_POINT_DURATION = 2000;

/**
 * Identify inefficient refreshes of the Crimson Tempest DoT.
 */
class CrimsonTempestSnapshot extends Snapshot {
  get durationOfFresh() {
    return BASE_DURATION + this.comboPointsOnLastCast * COMBO_POINT_DURATION;
  }

  static spellCastId = SPELLS.CRIMSON_TEMPEST_TALENT.id;
  static debuffId = SPELLS.CRIMSON_TEMPEST_TALENT.id;
  static spellIcon = SPELLS.CRIMSON_TEMPEST_TALENT.icon;
  comboPointsOnLastCast = 0;

  constructor(options: Options) {
    super(options);
    const combatant = this.selectedCombatant;
    if (
      combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) ||
      !combatant.hasTalent(SPELLS.CRIMSON_TEMPEST_TALENT.id)
    ) {
      this.active = false;
    }
    this.addEventListener(
      Events.SpendResource.by(SELECTED_PLAYER).spell(SPELLS.CRIMSON_TEMPEST_TALENT),
      this.onSpendResource,
    );
  }

  onSpendResource(event: SpendResourceEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsOnLastCast = event.resourceChange;
    }
  }
}

export default CrimsonTempestSnapshot;

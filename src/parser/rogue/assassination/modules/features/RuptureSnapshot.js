import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import Snapshot from '../core/Snapshot';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const BASE_DURATION = 4000;
const COMBO_POINT_DURATION = 4000;

/**
 * Identify inefficient refreshes of the Rupture DoT.
 */
class RuptureSnapshot extends Snapshot {
  static spellCastId = SPELLS.RUPTURE.id;
  static debuffId = SPELLS.RUPTURE.id;
  static spellIcon = SPELLS.RUPTURE.icon;

  comboPointsOnLastCast = 0;

  constructor(...args) {
    super(...args);
    const combatant = this.selectedCombatant;
    if (combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)) {
      this.active = false;
    }
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE), this.onSpendResource);
  }

  get durationOfFresh() {
    return BASE_DURATION + this.comboPointsOnLastCast * COMBO_POINT_DURATION;
  }

  onSpendResource(event) {
    if (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsOnLastCast = event.resourceChange;
    }
  }
}

export default RuptureSnapshot;

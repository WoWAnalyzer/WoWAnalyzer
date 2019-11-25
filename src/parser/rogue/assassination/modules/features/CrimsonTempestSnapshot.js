import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Snapshot from '../core/Snapshot';

const BASE_DURATION = 2000;
const COMBO_POINT_DURATION = 2000;

/**
 * Identify inefficient refreshes of the Crimson Tempest DoT.
 */
class CrimsonTempestSnapshot extends Snapshot {
  static spellCastId = SPELLS.CRIMSON_TEMPEST_TALENT.id;
  static debuffId = SPELLS.CRIMSON_TEMPEST_TALENT.id;
  static spellIcon = SPELLS.CRIMSON_TEMPEST_TALENT.icon;

  comboPointsOnLastCast = 0;

  constructor(...args) {
    super(...args);
    const combatant = this.selectedCombatant;
    if (combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) || !combatant.hasTalent(SPELLS.CRIMSON_TEMPEST_TALENT.id)) {
      this.active = false;
    }
  }

  get durationOfFresh() {
    return BASE_DURATION + this.comboPointsOnLastCast * COMBO_POINT_DURATION;
  }

  on_byPlayer_spendresource(event) {
    if (SPELLS.CRIMSON_TEMPEST_TALENT.id === event.ability.guid &&
        event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsOnLastCast = event.resourceChange;
    }
  }
}

export default CrimsonTempestSnapshot;

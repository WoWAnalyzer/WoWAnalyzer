import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { ClassResources } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

// Primal Fury may be slightly delayed.
const PRIMAL_FURY_WINDOW = 50; //ms

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  /**
   * A critical hit from a generator triggers Primal Fury which gives an extra combo point.
   * A Feral druid should always build up 5 combo points and crits are unpredictable.
   * Generators used at 4 combo points that crit will waste the Primal Fury generation but
   * this is unavoidable, or at least shouldn't be avoided.
   *
   * Also, Convoke the Spirits is liable to produce more than 5 CPs, and so waste that occurs
   * during Convoke is also unavoidable.
   */
  unavoidableWaste = 0;

  castToMaxCpTimestamp: number | null = null;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.COMBO_POINTS;
    this.maxResource = 5;
  }

  _applyBuilder(
    spellId: number,
    gain: number,
    waste: number,
    timestamp: number,
    resource?: ClassResources,
  ) {
    const isMaxBefore = this.current === this.maxResource;
    super._applyBuilder(spellId, gain, waste, timestamp, resource);
    const isMaxAfter = this.current === this.maxResource;

    if (!isMaxBefore && isMaxAfter) {
      this.castToMaxCpTimestamp = this.owner.currentTimestamp;
      return;
    }

    if (isConvoking(this.selectedCombatant)) {
      this.unavoidableWaste += waste;
    } else if (
      spellId === SPELLS.PRIMAL_FURY.id &&
      this.owner.currentTimestamp - (this.castToMaxCpTimestamp || 0) < PRIMAL_FURY_WINDOW
    ) {
      this.unavoidableWaste += 1;
    }
  }
}

export default ComboPointTracker;

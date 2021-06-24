import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { ClassResources } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

// Primal Fury may be slightly delayed.
const PRIMAL_FURY_WINDOW = 50; //ms

class ComboPointTracker extends ResourceTracker {
  /**
   * A critical hit from a generator triggers Primal Fury which gives an extra combo point.
   * A Feral druid should always build up 5 combo points and crits are unpredictable.
   * Generators used at 4 combo points that crit will waste the Primal Fury generation but
   * this is unavoidable, or at least shouldn't be avoided.
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
    resource?: ClassResources,
    timestamp?: number,
  ) {
    const isMaxBefore = this.current === this.maxResource;
    super._applyBuilder(spellId, gain, waste, resource, timestamp);
    const isMaxAfter = this.current === this.maxResource;

    if (!isMaxBefore && isMaxAfter) {
      this.castToMaxCpTimestamp = this.owner.currentTimestamp;
      return;
    }

    // primal fury procs that happen right after a cast that brought us to max CP shouldn't count as waste because it was out of the player's control
    if (
      spellId === SPELLS.PRIMAL_FURY.id &&
      this.owner.currentTimestamp - (this.castToMaxCpTimestamp || 0) < PRIMAL_FURY_WINDOW
    ) {
      this.unavoidableWaste += 1;
    }
  }
}

export default ComboPointTracker;

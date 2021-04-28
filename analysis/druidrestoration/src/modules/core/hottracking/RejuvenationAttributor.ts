import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';

import HotTrackerRestoDruid from './HotTrackerRestoDruid';
import { Attribution } from 'parser/shared/modules/HotTracker';

const REJUV_SPELLS = [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION];

const BUFFER_MS = 150; // saw a few cases of taking close to 150ms from cast -> applybuff

/*
 * Backend module tracks attribution of Rejuvenations
 * TODO - Revive this new module to use with Shadowlands attributions
 */
class RejuvenationAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  protected hotTracker!: HotTrackerRestoDruid;

  // cast tracking stuff
  lastRejuvCastTimestamp: number | undefined;
  lastRejuvTarget: number | undefined;
  castRejuvApplied: boolean; // occasionally procs happen on target that was just cast on, assures that no more than 1 apply/refreshbuff is attributed per cast
  lastWildGrowthCastTimestamp: number | undefined;

  constructor(options: Options) {
    super(options);
    this.castRejuvApplied = true;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.WILD_GROWTH]),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(REJUV_SPELLS),
      this._getRejuvAttribution,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(REJUV_SPELLS),
      this._getRejuvAttribution,
    );
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    // set last cast timestamps, used for attribution of HoT applications later
    if (spellId === SPELLS.REJUVENATION.id) {
      this.lastRejuvCastTimestamp = event.timestamp;
      this.lastRejuvTarget = targetId;
      this.castRejuvApplied = false;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      this.lastWildGrowthCastTimestamp = event.timestamp;
    }
  }

  // gets attribution for a given applybuff/refreshbuff of Rejuvenation or Germination
  _getRejuvAttribution(event: ApplyBuffEvent | RefreshBuffEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const timestamp = event.timestamp;
    const attributions: Attribution[] = [];

    if (
      event.prepull ||
      (this.lastRejuvCastTimestamp !== undefined &&
        this.lastRejuvCastTimestamp + BUFFER_MS > timestamp &&
        this.lastRejuvTarget === targetId &&
        !this.castRejuvApplied)
    ) {
      // regular cast (assume prepull applications are hardcast)
      // standard hardcast gets no special attribution
      this.castRejuvApplied = true;
    } else {
      console.warn(
        `Unable to attribute Rejuv @${this.owner.formatTimestamp(timestamp)} on ${targetId}`,
      );
    }

    attributions.forEach((att) => {
      this.hotTracker.addAttribution(att, targetId, spellId);
    });
  }
}

export default RejuvenationAttributor;

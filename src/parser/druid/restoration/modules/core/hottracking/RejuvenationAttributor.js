import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import HotTracker from './HotTracker';
import Events from 'parser/core/Events';

const REJUV_SPELLS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
];

const BUFFER_MS = 150; // saw a few cases of taking close to 150ms from cast -> applybuff

/*
 * Backend module tracks attribution of Rejuvenations
 * TODO - Dead module?
 */
class RejuvenationAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
  };

  // cast tracking stuff
  lastRejuvCastTimestamp;
  lastRejuvTarget;
  castRejuvApplied; // occasionally procs happen on target that was just cast on, assures that no more than 1 apply/refreshbuff is attributed per cast
  lastWildGrowthCastTimestamp;

  constructor(...args) {
    super(...args);
    this.castRejuvApplied = true;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.WILD_GROWTH]), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(REJUV_SPELLS), this._getRejuvAttribution);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(REJUV_SPELLS), this._getRejuvAttribution);
  }

  onCast(event) {
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
  _getRejuvAttribution(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const timestamp = event.timestamp;
    const attributions = [];

    if (event.prepull || (this.lastRejuvCastTimestamp + BUFFER_MS > timestamp && this.lastRejuvTarget === targetId && !this.castRejuvApplied)) {
      // regular cast (assume prepull applications are hardcast)
      // standard hardcast gets no special attribution
      this.castRejuvApplied = true;
    } else {
      console.warn(`Unable to attribute Rejuv @${this.owner.formatTimestamp(timestamp)} on ${targetId}`);
    }

    attributions.forEach(att => {
      this.hotTracker.addAttribution(att, targetId, spellId);
    });
  }

}

export default RejuvenationAttributor;

import SPELLS from 'common/SPELLS/rogue';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

import { ROLL_THE_BONES_STAGE_AURAS, ROLL_THE_BONES_DURATION } from '../../constants';
import OutlawEnergyCapTracker from 'analysis/retail/rogue/outlaw/modules/core/OutlawEnergyCapTracker';

export interface RTBCast extends CastEvent {
  appliedBuffs: Spell[];
  /** The stage this cast landed on, 1-4, or 0. Count the stage, not the number of auras. */
  stage: number;
  duration: number;
  isRefresh: boolean;
  timestampEnd?: number;
  RTBIsDelayed?: boolean;
}

// e.g. 1 combo point is 12 seconds, 3 combo points is 24 seconds
const PANDEMIC_WINDOW = 0.3;

/**
 * This module will group buffs applied by Roll the Bones by their respective casts
 * The purpose is to make it easier to do analysis on roll efficiency, etc.
 *
 * Roll the Bones itself will have AURA_APPLIED, AURA_REFRESH, and AURA_REMOVED events
 * Buffs granted by RTB will not have their own AURA_REFRESH; only the AURA_APPLIED and AURA_REMOVED events
 * Buffs granted by RTB will not have an AURA_REMOVED nor an AURA_APPLIED if they are being refreshed. They just carry on
 *
 * Order of events when you cast Roll the Bones:
 * AURA_REMOVED for any granted buffs that are dropping off (only if this is a refresh, otherwise they'd just have a separate AURA_REMOVED prior to the cast)
 * AURA_APPLIED/AURA_REFRESH for Roll the Bones
 * AURA_APPLIED for any granted buffs being added
 * CAST_SUCCESS for Roll the Bones
 */
class RollTheBonesCastTracker extends Analyzer {
  get lastCast(): RTBCast {
    return this.rolltheBonesCastEvents[this.rolltheBonesCastEvents.length - 1];
  }

  static dependencies = {
    energyCapTracker: OutlawEnergyCapTracker,
  };
  protected energyCapTracker!: OutlawEnergyCapTracker;

  rolltheBonesCastEvents: RTBCast[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES),
      this.processCast,
    );
  }

  castRemainingDuration(cast: RTBCast) {
    if (!cast.timestampEnd) {
      return 0;
    }

    return cast.duration - (cast.timestampEnd - cast.timestamp);
  }

  processCast(event: CastEvent) {
    if (!event || !event.classResources) {
      return;
    }
    const refresh = this.lastCast
      ? event.timestamp < this.lastCast.timestamp + this.lastCast.duration
      : false;

    // All of the events for adding/removing buffs occur at the same timestamp as the cast, so this.selectedCombatant.hasBuff isn't quite accurate
    const appliedBuffs = ROLL_THE_BONES_STAGE_AURAS.filter((b) =>
      this.energyCapTracker.combatantHasBuffActive(b.id),
    );
    const stage = ROLL_THE_BONES_STAGE_AURAS.reduce(
      (highest, buff, index) => (appliedBuffs.includes(buff) ? index + 1 : highest),
      0,
    );

    let duration = ROLL_THE_BONES_DURATION;

    // If somehow logging starts in the middle of combat and the first cast is actually a refresh, pandemic timing and previous buffs will be missing
    if (refresh && this.lastCast) {
      this.lastCast.timestampEnd = event.timestamp;

      // pandemic works a little differently for rogues. RTB works the same way Rupture works for Assassination
      // the allowed pandemic amount is based on the CURRENT combo points, not the buff/dot that is already applied
      // e.g. 1s remaining, refresh with 30s, final is 31s. 20s remaining, refresh with 30s, final is 39s
      duration += Math.min(this.castRemainingDuration(this.lastCast), duration * PANDEMIC_WINDOW);
    }

    const newCast: RTBCast = {
      ...event,
      appliedBuffs: appliedBuffs,
      stage: stage,
      duration: duration,
      isRefresh: refresh,
    };

    this.rolltheBonesCastEvents.push(newCast);
  }
}

export default RollTheBonesCastTracker;

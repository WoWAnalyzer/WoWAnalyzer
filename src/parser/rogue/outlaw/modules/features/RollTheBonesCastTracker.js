import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

import EnergyCapTracker from '../../../shared/resources/EnergyCapTracker'; // todo use the outlaw cap tracker once available
import { ROLL_THE_BONES_BUFFS, ROLL_THE_BONES_DURATION } from '../../constants';

export const ROLL_THE_BONES_CATEGORIES = {
  LOW_VALUE: 'low',
  MID_VALUE: 'mid',
  HIGH_VALUE: 'high',
};

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
  static dependencies = {
    energyCapTracker: EnergyCapTracker,
  };

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES), this.processCast);
  }

  rolltheBonesCastEvents = [];
  rolltheBonesCastValues = Object.values(ROLL_THE_BONES_CATEGORIES).reduce((map, label) => {
    map[label] = [];
    return map;
  }, {});

  get lastCast(){
    return this.rolltheBonesCastEvents[this.rolltheBonesCastEvents.length-1];
  }

  categorizeCast(cast){
    if(cast.appliedBuffs.some(buff => buff.id === SPELLS.RUTHLESS_PRECISION.id || buff.id === SPELLS.GRAND_MELEE.id)){
      return ROLL_THE_BONES_CATEGORIES.HIGH_VALUE;
    } else if(cast.appliedBuffs.length > 1){
      return ROLL_THE_BONES_CATEGORIES.MID_VALUE;
    }

    return ROLL_THE_BONES_CATEGORIES.LOW_VALUE;
  }

  castRemainingDuration(cast){
    if(!cast.timestampEnd){
      return 0;
    }

    return cast.duration - (cast.timestampEnd - cast.timestamp);
  }

  processCast(event){
    if(!event || !event.classResources){
      return;
    }
    const refresh = this.lastCast ? event.timestamp < (this.lastCast.timestamp + this.lastCast.duration) : false;

    // All of the events for adding/removing buffs occur at the same timestamp as the cast, so this.selectedCombatant.hasBuff isn't quite accurate
    const appliedBuffs = ROLL_THE_BONES_BUFFS.filter(b => this.energyCapTracker.combatantHasBuffActive(b.id));

    let duration = ROLL_THE_BONES_DURATION;

    // If somehow logging starts in the middle of combat and the first cast is actually a refresh, pandemic timing and previous buffs will be missing
    if(refresh && this.lastCast){
      this.lastCast.timestampEnd = event.timestamp;

      // pandemic works a little differently for rogues. RTB works the same way Rupture works for Assassination
      // the allowed pandemic amount is based on the CURRENT combo points, not the buff/dot that is already applied
      // e.g. 1s remaining, refresh with 30s, final is 31s. 20s remaining, refresh with 30s, final is 39s
      duration += Math.min(this.castRemainingDuration(this.lastCast), duration * PANDEMIC_WINDOW);
    }

    const newCast = {
      ...event,
      appliedBuffs: appliedBuffs,
      duration: duration,
      isRefresh: refresh,
    };

    this.rolltheBonesCastEvents.push(newCast);
    this.rolltheBonesCastValues[this.categorizeCast(newCast)].push(newCast);
  }
}

export default RollTheBonesCastTracker;

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

import { ROLL_THE_BONES_BUFFS } from '../../constants';

// e.g. 1 combo point is 12 seconds, 3 combo points is 24 seconds
const ROLL_THE_BONES_BASE_DURATION = 6 * 1000;
const ROLL_THE_BONES_CP_DURATION = 6 * 1000;
const PANDEMIC_WINDOW = 0.3;

/**
 * This module will group buffs applied by Roll the Bones by their respective casts
 * The purpose is to make it easier to do analysis on roll efficiency, etc.
 * 
 * Roll the Bones itself will have AURA_APPLIED, AURA_REFRESH, and AURA_REMOVED events
 * Buffs granted by RTB will not have their own AURA_REFRESH; only the AURA_APPLIED and AURA_REMOVED events
 * Buffs granted by RTB will not have an AURA_REMOVED nor an AURA_APPLIED if they are being refreshed. They just carry on
 * This means tracking which buffs are part of which cast gets a little complicated
 * 
 * Order of events when you cast Roll the Bones:
 * AURA_REMOVED for any granted buffs that are dropping off (only if this is a refresh, otherwise they'd just have a separate AURA_REMOVED prior to the cast)
 * AURA_APPLIED/AURA_REFRESH for Roll the Bones
 * AURA_APPLIED for any granted buffs being added
 * CAST_SUCCESS for Roll the Bones 
 */
class RollTheBonesCastTracker extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES), this.addEvent);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES), this.addEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ROLL_THE_BONES), this.processEvents);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(ROLL_THE_BONES_BUFFS), this.addEvent);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(ROLL_THE_BONES_BUFFS), this.addEvent);
  }

  // collect all of the AURA_ events in this buffer, and then process them with each CAST_SUCCESS
  _eventBuffer = [];

  rolltheBonesCastEvents = [];

  // group the casts together by their relative value
  rolltheBonesCastValues = { low: [], mid: [], high: [] };

  get lastCast(){
    return this.rolltheBonesCastEvents[this.rolltheBonesCastEvents.length-1];
  }  

  get bufferRefreshEvent(){
    return this._eventBuffer.find(event => event.type === 'refreshbuff');
  }

  get bufferRemovedBuffEvents(){
    return this._eventBuffer.filter(event => event.type === 'removebuff');
  }

  get bufferAppliedBuffEvents(){
    return this._eventBuffer.filter(event => event.type === 'applybuff' && event.ability.guid !== SPELLS.ROLL_THE_BONES.id);
  }

  addEvent(event){
    this._eventBuffer.push(event);
  }

  addCast(cast){
    this.rolltheBonesCastEvents.push(cast);
    this.rolltheBonesCastValues[this.categorizeCast(cast)].push(cast);
  }

  categorizeCast(cast){
    if(cast.appliedBuffEvents.some(buff => buff.ability.guid === SPELLS.RUTHLESS_PRECISION.id || buff.ability.guid === SPELLS.GRAND_MELEE.id)){
      return 'high';
    }
    else if(cast.appliedBuffEvents.length > 1){
      return 'mid';
    }
    
    return 'low';
  }

  castRemainingDuration(cast){
    if(!cast.timestampEnd){
      return 0;
    }

    return cast.duration - (cast.timestampEnd - cast.timestamp);
  }

  processEvents(event){
    if(!event || !event.classResources){
      return;
    }
    const cpCost = getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id).cost;
    const refresh = this.bufferRefreshEvent !== undefined;

    let appliedBuffEvents = this.bufferAppliedBuffEvents;
    let duration = ROLL_THE_BONES_BASE_DURATION + (ROLL_THE_BONES_CP_DURATION * cpCost);

    // If somehow logging starts in the middle of combat and the first cast is actually a refresh, pandemic timing and previous buffs will be missing
    if(refresh && this.lastCast){
      this.lastCast.timestampEnd = event.timestamp;

      // pandemic works a little differently for rogues. RTB works the same way Rupture works for Assassination
      // the allowed pandemic amount is based on the CURRENT combo points, not the buff/dot that is already applied
      // e.g. 1s remaining, refresh with 30s, final is 31s. 20s remaining, refresh with 30s, final is 39s
      duration += Math.min(this.castRemainingDuration(this.lastCast), duration * PANDEMIC_WINDOW);

      // Since this is a refresh, we want to include any buffs that were applied in the last cast, but not removed by this one
      const rolledOverBuffEvents = this.lastCast.appliedBuffEvents
        .filter(checkBuff => this.bufferRemovedBuffEvents.every(buff => buff.ability.guid !== checkBuff.ability.guid));
      appliedBuffEvents = appliedBuffEvents.concat(rolledOverBuffEvents);
    }

    const newCast = {
      ...event,
      appliedBuffEvents: appliedBuffEvents,
      duration: duration,
      isRefresh: refresh,
    };

    this.addCast(newCast);
    this._eventBuffer = [];
  }  
}

export default RollTheBonesCastTracker;

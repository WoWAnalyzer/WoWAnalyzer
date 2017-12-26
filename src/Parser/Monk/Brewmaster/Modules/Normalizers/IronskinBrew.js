import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'Parser/Core/EventsNormalizer';

const ISB_BASE_DURATION = 6000;
const PK_EXTRA_DURATION = 500;
const PURIFY_DURATION = 1000; // duration added by purifying brew when the Quick Sip trait is learned
const DURATION_CAP_FACTOR = 3;

const debug = false;

/**
 * This class normalizes the event stream for the bug specifically with
 * ISB: if the fight starts with ISB up, and the combatant never lets it
 * drop, then there are no buff events for it. ApplyBuff doesn't
 * normalize correctly in this case because no buff-related
 * events fire for it ever, only casts.
 */
class IronskinBrewNormalizer extends EventsNormalizer {
  _combatantInfoEvents = {};
  initialize(combatants) {
    this._combatantInfoEvents = combatants;
  }

  normalize(events) {
    const isb_casts = {};
    const isb_buffs = {};
    let isb_ability;
    let isb_buff_ability;
    for(let i = 0; i < events.length; i++) {
      const event = events[i];
      const sourceID = event.sourceID;
      const targetID = event.targetID;
      const spellId = event.ability ? event.ability.guid : null;

      if(event.type === "cast" && SPELLS.IRONSKIN_BREW.id === spellId) {
        isb_casts[sourceID] = isb_casts[sourceID] ? isb_casts[sourceID] : [];
        isb_casts[sourceID].push(event);
        if(!isb_ability) {
          isb_ability = event.ability;
        }
      } else if((event.type === "applybuff" || event.type === "refreshbuff" || event.type === "removebuff") && SPELLS.IRONSKIN_BREW_BUFF.id === spellId) {
        isb_buffs[targetID] = isb_buffs[targetID] ? isb_buffs[targetID] : [];
        isb_buffs[targetID].push(event);
        if(!isb_buff_ability) {
          isb_buff_ability = event.ability;
        }
      }
    }
    // these targets are bugged, having >= 1 ISB casts but no ISB buff
    // events
    const bugged_targets = Object.keys(isb_casts).filter((target) => !isb_buffs.hasOwnProperty(target));
    debug && console.log(isb_casts, isb_buffs, bugged_targets);
    if(bugged_targets.length === 0) {
      // nobody is bugged, skip the rest
      return events;
    }

    if(!isb_buff_ability) {
      isb_buff_ability = {
        guid: SPELLS.IRONSKIN_BREW_BUFF.id,
        icon: SPELLS.IRONSKIN_BREW_BUFF.icon,
        name: SPELLS.IRONSKIN_BREW_BUFF.name,
      };
    }
    
    for(let i = 0; i < bugged_targets.length; i++) {
      const targetID = parseInt(bugged_targets[i], 10);
      const targetInfo = this._combatantInfoEvents.find(event => event.sourceID === targetID);
      const pk = targetInfo.artifact.find(trait => trait.spellID === SPELLS.POTENT_KICK.id);
      const qs = targetInfo.artifact.find(trait => trait.spellID === SPELLS.QUICK_SIP.id);
      const pk_rank = pk ? pk.rank : 0;
      const has_qs = qs ? qs.rank === 1 : false;

      const DURATION = ISB_BASE_DURATION + pk_rank * PK_EXTRA_DURATION;
      const CAP = DURATION_CAP_FACTOR * DURATION;

      const fab = (ty, ts) => { 
        return {
          timestamp: ts,
          type: ty,
          ability: isb_buff_ability,
          sourceID: targetID,
          targetID: targetID,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          __fabricated: true,
          __fabricatedBy: "isb_normalize",
        };
      };

      // first we are going to fabricate the initial applybuff
      // immediately before the first damage the target would take. this
      // is done because the bug occurs when we have 100% uptime, and if
      // we don't set the timestamp to be late enough we can actually
      // get much less than 100% uptime
      const first_dmg = events.find(event => event.type === "damage" && event.targetID === targetID);
      const first_dmg_idx = events.indexOf(first_dmg);
      events.splice(first_dmg_idx, 0, fab("applybuff", first_dmg.timestamp - 1));
      let currentBuffTime = DURATION;
      // now we go through the event list and fabricate correct buff
      // events
      for(let j = first_dmg_idx; j < events.length; j++) {
        const event = events[j];
        const spellId = event.ability ? event.ability.guid : null;
        if(event.__fabricated) {
          continue;
        }
        if(currentBuffTime > 0) {
          currentBuffTime -= event.timestamp - events[j-1].timestamp;
          if(currentBuffTime <= 0) {
            console.warn(`removebuff (${event.timestamp + currentBuffTime})-- this should not happen!`);
            events.splice(j, 0, fab("removebuff", event.timestamp + currentBuffTime));
            currentBuffTime = 0;
            continue; // we will process the same event again on the next iteration, but with a correct j for further fabs
          }
        }
        if(event.sourceID === targetID && event.type === "cast") {
          if (SPELLS.IRONSKIN_BREW.id === spellId) {
            if(currentBuffTime === 0) {
              debug && console.log(`applybuff (${event.timestamp}) -- ${DURATION}`);
              events.splice(j+1, 0, fab("applybuff", event.timestamp));
              currentBuffTime = DURATION;
            } else {
              events.splice(j+1, 0, fab("refreshbuff", event.timestamp));
              currentBuffTime += DURATION;
              if(currentBuffTime > CAP) {
                currentBuffTime = CAP;
              }
              debug && console.log(`refreshbuff (${event.timestamp}) -- ${currentBuffTime}`);
            }
          } else if (has_qs && SPELLS.PURIFYING_BREW.id === spellId) {
            if(currentBuffTime === 0) {
              debug && console.log(`applybuff (${event.timestamp}) -- ${PURIFY_DURATION}`);
              events.splice(j+1, 0, fab("applybuff", event.timestamp));
              currentBuffTime = PURIFY_DURATION;
            } else {
              events.splice(j+1, 0, fab("refreshbuff", event.timestamp));
              currentBuffTime += PURIFY_DURATION;
              if(currentBuffTime > CAP) {
                currentBuffTime = CAP;
              }
              debug && console.log(`refreshbuff (${event.timestamp}) -- ${currentBuffTime}`);
            }
          }
        }
      }
    }
    return events;
  }
}

export default IronskinBrewNormalizer;

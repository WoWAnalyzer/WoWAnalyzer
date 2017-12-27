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
    const isbCasts = {};
    const isbBuffs = {};
    let isbAbility;
    let isbBuffAbility;
    for(let i = 0; i < events.length; i++) {
      const event = events[i];
      const sourceID = event.sourceID;
      const targetID = event.targetID;
      const spellId = event.ability ? event.ability.guid : null;

      if(event.type === "cast" && SPELLS.IRONSKIN_BREW.id === spellId) {
        isbCasts[sourceID] = isbCasts[sourceID] ? isbCasts[sourceID] : [];
        isbCasts[sourceID].push(event);
        isbAbility = isbAbility ? isbAbility : event.ability;
      } else if((event.type === "applybuff" || event.type === "refreshbuff" || event.type === "removebuff") && SPELLS.IRONSKIN_BREW_BUFF.id === spellId) {
        isbBuffs[targetID] = isbBuffs[targetID] ? isbBuffs[targetID] : [];
        isbBuffs[targetID].push(event);
        isbBuffAbility = isbBuffAbility ? isbBuffAbility : event.ability;
      }
    }
    // these targets are bugged, having >= 1 ISB casts but no ISB buff
    // events
    const buggedTargets = Object.keys(isbCasts).filter((target) => !isbBuffs.hasOwnProperty(target));
    debug && console.log(isbCasts, isbBuffs, buggedTargets);
    if(buggedTargets.length === 0) {
      // nobody is bugged, skip the rest
      return events;
    }

    if(!isbBuffAbility) {
      isbBuffAbility = {
        guid: SPELLS.IRONSKIN_BREW_BUFF.id,
        icon: SPELLS.IRONSKIN_BREW_BUFF.icon,
        name: SPELLS.IRONSKIN_BREW_BUFF.name,
      };
    }
    
    for(let i = 0; i < buggedTargets.length; i++) {
      const targetID = parseInt(buggedTargets[i], 10);
      const targetInfo = this._combatantInfoEvents.find(event => event.sourceID === targetID);
      // potent kick increases the duration of the isb buff
      const pk = targetInfo.artifact.find(trait => trait.spellID === SPELLS.POTENT_KICK.id);
      // quick sip causes purifying brew to add 1 second of the
      // isb buff
      const qs = targetInfo.artifact.find(trait => trait.spellID === SPELLS.QUICK_SIP.id);
      const pk_rank = pk ? pk.rank : 0;
      const has_qs = qs ? qs.rank === 1 : false;

      const DURATION = ISB_BASE_DURATION + pk_rank * PK_EXTRA_DURATION;
      const CAP = DURATION_CAP_FACTOR * DURATION;

      const fab = (ty, ts) => { 
        return {
          timestamp: ts,
          type: ty,
          ability: isbBuffAbility,
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
      const firstDmg = events.find(event => event.type === "damage" && event.targetID === targetID);
      const firstDmgIdx = events.indexOf(firstDmg);
      events.splice(firstDmgIdx, 0, fab("applybuff", firstDmg.timestamp - 1));
      let currentBuffTime = DURATION;
      // now we go through the event list and fabricate correct buff
      // events
      for(let j = firstDmgIdx; j < events.length; j++) {
        const event = events[j];
        const spellId = event.ability ? event.ability.guid : null;
        if(event.__fabricated) {
          continue;
        }
        if(currentBuffTime > 0) {
          currentBuffTime -= event.timestamp - events[j-1].timestamp;
          // using a nested if because this condition (if y modify y
          // (call it z), then if !y, operate on z) is most naturally
          // expressed this way
          if(currentBuffTime <= 0) {
            console.warn(`removebuff (${event.timestamp + currentBuffTime})-- this should not happen!`);
            events.splice(j, 0, fab("removebuff", event.timestamp + currentBuffTime));
            currentBuffTime = 0;
            // we will process the same event again on the next
            // iteration, but with a correct j for further fabs
            continue; 
          }
        }
        // the ISB buff can only result from a cast by the user, skip
        // everything else
        if(event.sourceID !== targetID || event.type !== "cast") {
          continue;
        }
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
          // if the user has the Quick Sip trait, purifying brew also
          // applies ISB.
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
    return events;
  }
}

export default IronskinBrewNormalizer;

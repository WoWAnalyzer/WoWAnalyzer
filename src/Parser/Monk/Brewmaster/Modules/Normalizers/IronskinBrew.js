import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'Parser/Core/EventsNormalizer';

const debug = false;

/**
 * This class normalizes the event stream for the bug specifically with
 * ISB: if the fight starts with ISB up, and the combatant never lets it
 * drop, then there are no buff events for it. ApplyBuff doesn't
 * normalize correctly in this case because no buff-related
 * events fire for it ever, only casts.
 */
class IronskinBrew extends EventsNormalizer {
  // stolen from ApplyBuff
  _getFirstEventIndex(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type !== 'combatantinfo') {
        return i;
      }
    }
    throw new Error('Fight doesn\'t have a first event, something must have gone wrong.');
  }

  _combatantInfoEvents = {};
  initialize(combatants) {
    this._combatantInfoEvents = combatants;
  }

  normalize(events) {
    const isbCasts = {};
    const isbBuffs = {};
    let isbBuffAbility;
    for(let i = 0; i < events.length; i++) {
      const event = events[i];
      const sourceID = event.sourceID;
      const targetID = event.targetID;
      const spellId = event.ability ? event.ability.guid : null;

      if(event.type === "cast" && SPELLS.IRONSKIN_BREW.id === spellId) {
        isbCasts[sourceID] = isbCasts[sourceID] ? isbCasts[sourceID] : [];
        isbCasts[sourceID].push(event);
      } else if(["applybuff", "refreshbuff", "removebuff"].includes(event.type) && SPELLS.IRONSKIN_BREW_BUFF.id === spellId) {
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

    // ideally we observe the buff (i.e. on another tank), buuuuut we
    // often won't, so we build it in that case
    if(!isbBuffAbility) {
      isbBuffAbility = {
        guid: SPELLS.IRONSKIN_BREW_BUFF.id,
        icon: SPELLS.IRONSKIN_BREW_BUFF.icon,
        name: SPELLS.IRONSKIN_BREW_BUFF.name,
      };
    }
    
    // to maintain sanity, we insert our events after all the
    // combatantinfo events -- identified by this index
    const firstNonInfoIdx = this._getFirstEventIndex(events);
    for(let i = 0; i < buggedTargets.length; i++) {
      const targetID = Number(buggedTargets[i]);
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

      // then we add a single applybuff event after the combatantinfo
      // ironskinbrew does not trigger refreshbuff, and we know a priori
      // that it was never allowed to drop (otherwise, we wouldn't be
      // here).
      events.splice(firstNonInfoIdx, 0, fab("applybuff", events[firstNonInfoIdx].timestamp - 1));
    }
    return events;
  }
}

export default IronskinBrew;

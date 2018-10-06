import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;

// If a prepull spell applies a buff and has a CD that we may care about tracking efficiency for, it should be here
const PREPULL_BUFF_CDS = [
  SPELLS.ICY_VEINS.id,
  SPELLS.ARCANE_POWER.id,
  SPELLS.COMBUSTION.id,

  // Debatable whether these types of spells should be included. They can be cast long before pull.
  //SPELLS.PRISMATIC_BARRIER.id,
  //SPELLS.ICE_BARRIER.id,
  //SPELLS.BLAZING_BARRIER.id,
];

// If a prepull spell does damage and has a CD that we may care about tracking efficiency for, it should be here
const PREPULL_DMG_CDS = [
  {cast: SPELLS.METEOR_TALENT.id, damage: SPELLS.METEOR_DAMAGE.id},
  {cast: SPELLS.PHOENIX_FLAMES_TALENT.id, damage: SPELLS.PHOENIX_FLAMES_TALENT.id},
  {cast: SPELLS.ARCANE_ORB_TALENT.id, damage: SPELLS.ARCANE_ORB_DAMAGE.id},
  {cast: SPELLS.EBONBOLT_TALENT.id, damage: SPELLS.EBONBOLT_DAMAGE.id},
  {cast: SPELLS.COMET_STORM_TALENT.id,damage: SPELLS.COMET_STORM_DAMAGE.id},
  {cast: SPELLS.FROZEN_ORB.id, damage: SPELLS.FROZEN_ORB_DAMAGE.id},
];

// TODO maybe update the Timeline tab to show these prepull casts?
/*
 * This normalizer attempts to track all potentially relevant casts that happened
 * before the pull. It then fabricates cast events in order to help other
 * modules (like cast efficiency) be more accurate. You should avoid using this to
 * track spells that require accurate cast event data in analyzers, as all of it is
 * fabricated.
 */
class PrePullCooldowns extends EventsNormalizer {

  static dependencies = {
    abilities: Abilities,
  };

  normalize(events) {
    const prepullCasts = [];
    let precastClassResources = null;

    const firstEventIndex = this.getFightStartIndex(events);
    const firstTimestamp = events[firstEventIndex].timestamp;
    const playerId = this.owner.playerId;

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const targetId = event.targetID;
      const sourceId = event.sourceID;

      if (sourceId !== playerId) {
        continue;
      }

      if (event.type === 'applybuff') {
        // Some specs may have cooldowns that apply to other people, but for now this only checks self-applied buffs
        if (targetId !== playerId) {
          continue;
        }

        const spellId = event.ability.guid;
        if (PREPULL_BUFF_CDS.includes(spellId) && event.prepull) {
          debug && this.log(`Detected a precast CD: ${event.ability.name} fight start: ${this.owner.fight.start_time}`);
          prepullCasts.push(this.constructor._fabricateCastEvent(event));
        }
        continue;
      }

      if (event.type === 'cast') {

        if (precastClassResources === null && event.classResources) {
          /* This will copy the first resource information to all precast events.
           * It's not pretty or 100% accurate, but it prevents errors on analyzers
           * that require resource information and usually wont be too far off.
           *
           * In the future, a better way to handle this would be to make sure any
           * analyzers that need the resource information check for .prepull, or
           * we gain access to spell data that lets us build the resource
           * information more accurately.
           */
          debug && console.log("Setting prepull class resources to:", event.classResources);
          precastClassResources = event.classResources;
        }

        const spellId = event.ability.guid;
        PREPULL_DMG_CDS.forEach(cdInfo => {
          if (cdInfo.cast === spellId) {
            cdInfo.wasCast = true;
          }
        });
      }

      if (event.type === 'damage') {
        const spellId = event.ability.guid;
        PREPULL_DMG_CDS.forEach(cdInfo => {
          if (cdInfo.damage === spellId) {
            if (!cdInfo.wasCast) {
              cdInfo.wasCast = true;
              debug && console.log(`Detected a precast damage cooldown: ${event.ability.name}`);
              prepullCasts.push(this.constructor._fabricateCastEvent(event, cdInfo.cast));
            }
          }
        });
      }
    }

    /*
     * Potential issue: If players cast buffs long before the pull that have a
     * long duration, this normalizer doesn't know that and assumes they
     * cast it optimized right before the pull. This means that the next time
     * it gets cast we may get an error saying it was still on cooldown. To
     * resolve this, we could also listen for buffremove events and use that
     * to deduce the cast time. This would require ability info about durations.
     */
    // Working backwards, assume worst-case GCD timestamps
    let totalGCD = 0;
    for (let i = prepullCasts.length - 1; i >= 0; i -= 1) {
      const event = prepullCasts[i];
      const ability = this.abilities.getAbility(event.ability.guid);
      const gcd = (ability && ability.gcd && ability.gcd.base) || 1500;
      totalGCD += gcd;
      event.timestamp = firstTimestamp - totalGCD;
      event.classResources = precastClassResources;
    }
    events.unshift(...prepullCasts);
    return events;
  }

  static _fabricateCastEvent(event, abilityId = null) {
    const ability = {
      abilityIcon: event.ability.abilityIcon,
      guid: abilityId || event.ability.guid,
      name: event.ability.name,
      type: event.ability.type,
    };

    return {
      type: 'cast',
      ability: ability,
      sourceID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetID: event.targetID,
      targetIsFriendly: event.targetIsFriendly,

      // Custom properties:
      prepull: true,
      __fabricated: true,
    };
  }

}

export default PrePullCooldowns;

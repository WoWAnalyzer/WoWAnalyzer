import Abilities from 'parser/shared/modules/Abilities';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;

/*
 * This normalizer attempts to track all potentially relevant casts that
 * happened before the pull. It then fabricates cast events in order to help
 * other modules (like cast efficiency) be more accurate.
 *
 * Additionally, because there is currently no ability info on whether or not a
 * spell is instant or has a cast time, we cannot (yet) accurately fabricate
 * the right type of event (begincast + cast vs only a cast).
 */
class PrePullCooldowns extends EventsNormalizer {

  /*
   * Abilities is an analyzer, which means that accessing it from a
   * normalizer like this one is not ideal design. For now, to avoid having to
   * rewrite Abilities (a core module heavily coupled with pretty much every
   * specialization), just be aware that using any Ability properties that
   * require event data (like .cooldown if it's a func, etc.) will *not*
   * produce intended results. In this normalizer I only access parts of the
   * spellbook with static values.
   */
  static dependencies = {
    abilities: Abilities,
  };

  normalize(events) {

    // region Build cooldown search arrays
    /*
     * Rather than constantly querying Abilities, here we simplify into two
     * new arrays that we can modify without messing with the spellbook
     */
    const buffSpells = [];
    const damageSpells = [];

    // TODO what filtering should we use to determine what spells we care about?
    for (const ability of this.abilities.activeAbilities) {
      if (ability.buffSpellId) {
        if(ability.buffSpellId instanceof Array) {
          ability.buffSpellId.forEach(buffId => {
            buffSpells.push({ castId: ability.spell.id, buffId: buffId });
          });
        } else {
          buffSpells.push({ castId: ability.spell.id, buffId: ability.buffSpellId });
        }
      }
      if (ability.damageSpellIds) {
        damageSpells.push({ castId: ability.spell.id, damageIds: ability.damageSpellIds });
      }
    }
    // endregion

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
        // We rely on the buffapply normalizer to set the prepull property
        if (targetId !== playerId || !event.prepull) {
          continue;
        }

        for (let i = 0; i < buffSpells.length; i += 1) {
          if (buffSpells[i].buffId === event.ability.guid) {
            debug && console.debug(`Detected a precast buff cooldown: ${event.ability.name}`);
            prepullCasts.push(this.constructor._fabricateCastEvent(event, buffSpells[i].castId));
            buffSpells.splice(i, 1);
            break;
          }
        }
        continue;
      }

      if (event.type === 'cast') {

        /*
         * This will copy the first resource information to all precast events.
         * It's not pretty or 100% accurate, but it prevents errors on analyzers
         * that require resource information and usually wont be too far off.
         *
         * In the future, a better way to handle this would be to make sure any
         * analyzers that need the resource information check for .prepull, or
         * we gain access to spell data that lets us build the resource
         * information more accurately.
         */
        if (precastClassResources === null && event.classResources) {
          debug && console.debug("Setting prepull class resources to:", event.classResources);
          precastClassResources = event.classResources;
        }

        // If a cast is found for a damage spell, remove it from the search
        for (let i = 0; i < damageSpells.length; i += 1) {
          if (damageSpells[i].castId === event.ability.guid) {
            damageSpells.splice(i, 1);
            break;
          }
        }
        continue;
      }

      if (event.type === 'damage') {
        // If a damage event already has a cast event, it shouldn't be in the array
        for (let i = 0; i < damageSpells.length; i += 1) {
          if (damageSpells[i].damageIds.some(id => id === event.ability.guid)) {
            debug && console.debug(`Detected a precast damage cooldown: ${event.ability.name}`);
            prepullCasts.push(this.constructor._fabricateCastEvent(event, damageSpells[i].castId));
            damageSpells.splice(i, 1);
            break;
          }
        }
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
      totalGCD += this._resolveAbilityGcd(event.ability.guid);
      event.timestamp = firstTimestamp - totalGCD;
      event.classResources = precastClassResources;
    }
    events.unshift(...prepullCasts);
    return events;
  }

  _resolveAbilityGcd(id) {
    const ability = this.abilities.getAbility(id);
    const gcdProp = ability.gcd;
    if (!gcdProp) {
      return 0;
    }
    if (typeof gcdProp.static === 'number') {
      return gcdProp.static;
    }
    if (typeof gcdProp.base === 'number') {
      return gcdProp.base;
    }
    // We can't resolve the gcd functions because this is a normalizer, so if no flat numbers are set we just assume worst-case
    return 1500;
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

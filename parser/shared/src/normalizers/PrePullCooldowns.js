import SPELLS from 'common/SPELLS';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import { EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { captureException } from 'common/errorLogger';

import ApplyBuff from './ApplyBuff';

const debug = false;

/**
 * This normalizer attempts to track all potentially relevant casts that
 * happened before the pull. It then fabricates cast events in order to help
 * other modules (like cast efficiency) be more accurate.
 *
 * Additionally, because there is currently no ability info on whether or not a
 * spell is instant or has a cast time, we cannot (yet) accurately fabricate
 * the right type of event (begincast + cast vs only a cast).
 *
 * @property {Abilities} abilities
 * @property {Buffs} buffs
 * @property {ApplyBuff} applyBuff
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
    buffs: Buffs,
    applyBuff: ApplyBuff, // we need fabricated events for untracked prepull applied buffs
  };

  /**
   * Rather than constantly querying Abilities, here we simplify into two
   * new arrays that we can modify without messing with the spellbook
   */
  getApplicableSpells() {
    const buffSpells = [];
    const damageSpells = [];
    const addBuff = (buff, buffId) => {
      if (!buff.triggeredBySpellId) {
        // This normalizer is to fabricate prepull cast events that can be detected from buffs (and damage). If a buff isn't triggered by a spell, then there's nothing to fabricate.
        return;
      }

      buffSpells.push({
        castId: buff.triggeredBySpellId,
        buffId,
      });
    };

    this.buffs.activeBuffs.forEach(buff => {
      if (buff.spellId instanceof Array) {
        // Add each buff separate to make usage easier
        buff.spellId.forEach(spellId => {
          addBuff(buff, spellId);
        });
      } else {
        addBuff(buff, buff.spellId);
      }
    });

    this.abilities.activeAbilities.forEach(ability => {
      if (ability.damageSpellIds) {
        damageSpells.push({
          castId: ability.spell.id,
          damageIds: ability.damageSpellIds,
        });
      }
    });

    return {
      buffSpells,
      damageSpells,
    };
  }

  normalize(events) {
    const { buffSpells, damageSpells } = this.getApplicableSpells();
    const prepullCasts = [];
    let precastClassResources = null;

    // When the fight started. Used for instants.
    const fightStartTimestamp = this.owner.fight.start_time;
    // When the player first cast something. Used for everything else (this is intended to optimally estimate channeled spells).
    const firstEventIndex = this.getFightStartIndex(events);
    const firstTimestamp = events[firstEventIndex].timestamp;
    const playerId = this.owner.playerId;

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const sourceId = event.sourceID;

      if (event.type === EventType.ApplyBuff) {
        // We rely on the ApplyBuff normalizer to set the prepull property
        if (!event.prepull) {
          continue;
        }

        for (let i = 0; i < buffSpells.length; i += 1) {
          if (buffSpells[i].buffId === event.ability.guid) {
            debug && console.debug(`Detected a precast buff cooldown: ${event.ability.name}`);
            if(buffSpells[i].castId instanceof Array && buffSpells[i].castId.includes(event.ability.guid)){ //try to find corresponding cast, otherwise pass list of casts
              prepullCasts.push(this.constructor._fabricateCastEvent(event));
            }else{
              prepullCasts.push(this.constructor._fabricateCastEvent(event, buffSpells[i].castId));
            }
            buffSpells.splice(i, 1);
            break;
          }
        }
        continue;
      }

      if (sourceId !== playerId) {
        continue;
      }

      if (event.type === EventType.Cast) {
        /**
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
          debug && console.debug('Setting prepull class resources to:', event.classResources);
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

      if (event.type === EventType.Damage) {
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

    /**
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
      const gcd = this._resolveAbilityGcd(event.ability.guid);
      if (gcd === 0) {
        // When the ability is off the GCD give it at least some margin so it properly appears as cast before the pull and out of combat
        event.timestamp = fightStartTimestamp - this.owner.fight.offset_time - 100;
      } else {
        totalGCD += gcd;
        event.timestamp = firstTimestamp - this.owner.fight.offset_time - totalGCD;
      }
      event.classResources = precastClassResources;
    }
    events.unshift(...prepullCasts);
    return events;
  }

  _resolveAbilityGcd(id) {
    const ability = this.abilities.getAbility(id);
    if (!ability) {
      captureException(new Error(`No ability available for spell: ${id}`));
      return 0;
    }
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

  static _fabricateCastEvent(event, castId = null) {
    let ability = event.ability;
    if (castId) {
      if (castId instanceof Array) {
        castId = castId[0];
      }
      const spell = SPELLS[castId];
      ability = {
        ...ability,
        guid: castId,
        abilityIcon: spell ? spell.icon : ability.abilityIcon,
        name: spell ? spell.name : event.ability.name,
      };
    }

    return {
      type: EventType.Cast,
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

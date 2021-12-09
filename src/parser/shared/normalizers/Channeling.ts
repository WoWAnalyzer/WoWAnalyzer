import SPELLS from 'common/SPELLS';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import {
  AnyEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
  HasAbility,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { insertEvents } from 'parser/core/insertEvents';
import { Options } from 'parser/core/Module';

/**
 * Channels and casts are handled differently in events, and some information is also missing and must be inferred.
 * This normalizer fabricates new BeginChannel and EndChannel events that delineate the cast times
 * for both casts and channels, and additionally includes inferred information.
 *
 * Instant spells have only a Cast event - they are ignored by this normalizer, which
 * is only concerned with cast time abilities.
 *
 * Spells with a cast time have a BeginCast event when they are started and and a Cast event when
 * they finish. If they are cancelled before finishing, there will be a BeginCast without the linked
 * Cast. For completed casts, this normalizer fabricates a BeginChannel for the start of the spell
 * and an EndChannel for the finish. For cancelled casts, there will only be a BeginChannel event
 * with the 'isCancelled' flag set.
 *
 * Channelled spells are handled inconsistently in the events, but this normalizer aims to uniformly
 * represent them with a BeginChannel when started and and EndChannel when stopped (regardless of if
 * the spell finished or it was stopped early). There are a variety of ways channeled spells show
 * in events, and this normalizer allows special case handling to be registered for each.
 */

// TODO go through everything and fill it out

class Channeling extends EventsNormalizer {
  /**
   * Listing of all special case handlers for channels
   */
  static CHANNEL_SPECS: ChannelSpec[] = [
    // General
    // Shadowlands Encounter
    buffChannelSpec(SPELLS.SOUL_INFUSION.id), // fight channel from Sun King's Salvation - see in this log: https://wowanalyzer.com/report/g4Pja6pLHnmQtbvk/32-Normal+Sun+King's+Salvation+-+Kill+(10:14)/Pjurbo/standard/events
    // Mage
    buffChannelSpec(SPELLS.EVOCATION.id),
    buffChannelSpec(SPELLS.SHIFTING_POWER.id),
    nextCastChannelSpec(SPELLS.ARCANE_MISSILES.id),
    // Warlock
    buffChannelSpec(SPELLS.DRAIN_SOUL_TALENT.id),
    // Priest
    buffChannelSpec(SPELLS.DIVINE_HYMN_CAST.id),
    nextCastChannelSpec(SPELLS.PENANCE_CAST.id),
    buffChannelSpec(SPELLS.VOID_TORRENT_TALENT.id),
    buffChannelSpec(SPELLS.MIND_FLAY.id), // TODO double check ID
    buffChannelSpec(SPELLS.MIND_SEAR.id), // TODO double check ID
    // Rogue
    // Druid
    buffChannelSpec(SPELLS.CONVOKE_SPIRITS.id),
    // Monk
    buffChannelSpec(SPELLS.ZEN_MEDITATION.id),
    buffChannelSpec(SPELLS.ESSENCE_FONT.id),
    buffChannelSpec(SPELLS.SOOTHING_MIST.id),
    buffChannelSpec(SPELLS.CRACKLING_JADE_LIGHTNING.id),
    buffChannelSpec(SPELLS.FISTS_OF_FURY_CAST.id),
    // Demon Hunter
    buffChannelSpec(SPELLS.EYE_BEAM.id), // TODO special handling because of the two buffs?
    // Shaman
    // Hunter
    buffChannelSpec(SPELLS.RAPID_FIRE.id),
    // TODO Barrage - can't find a single log with someone taking the talent...
    // Paladin
    // Warrior
    buffChannelSpec(SPELLS.BLADESTORM_TALENT.id),
    buffChannelSpec(SPELLS.BLADESTORM.id),
    // Death Knight
    buffChannelSpec(SPELLS.BLOODDRINKER_TALENT.id),
  ];

  // registered special case handlers, mapped by guid
  channelSpecMap: { [key: number]: ChannelHandler } = {};

  /**
   * Constructs a Channeling normalizer that deals with normal hardcasts and instants by default,
   * and then allows special case functions to be registered by spellId for channels.
   * @param channelSpecs special case functions that handle specific spells
   */
  constructor(options: Options) {
    super(options);

    // populate the specs into a mapping for quick handling
    Channeling.CHANNEL_SPECS.forEach((spec) => {
      spec.guids.forEach((guid) => {
        if (this.channelSpecMap[guid]) {
          console.error(
            'Channeling module trying to add more than one handler for spell guid ' +
              guid +
              ' - only the latest handler will apply!',
          );
        }
        this.channelSpecMap[guid] = spec.handler;
      });
    });
  }

  normalize(events: AnyEvent[]) {
    const channelState: ChannelState = {
      unresolvedChannel: null,
      newEvents: [],
    };

    // for each event, check if there is a special case handler for that GUID -
    // if so - call the handler, if not - call the default handling
    events.forEach((event: AnyEvent, index: number) => {
      const handler = HasAbility(event) ? this.channelSpecMap[event.ability.guid] : undefined;
      if (handler) {
        handler(event, events, index, channelState);
      } else {
        this.defaultHandler(event, events, index, channelState);
      }
    });

    return insertEvents(events, channelState.newEvents);
  }

  /**
   * Handles the default cases of regular cast time spells, instants, and 'fake' casts
   */
  defaultHandler(
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    channelState: ChannelState,
  ): void {
    if (event.type === EventType.BeginCast) {
      // we're starting a new generic hardcast
      cancelCurrentChannel(event, channelState);
      beginCurrentChannel(event, channelState);
    } else if (event.type === EventType.Cast) {
      // TODO this won't catch pre-cast channels
      // this could be a few things: an instant cast, a hardcast finishing, or a "fake" cast
      if (!isRealCast(event)) {
        return;
      } else if (!channelState.unresolvedChannel) {
        // there's no current channel, meaning this is an instant cast
        // TODO anything else to do here?
      } else if (channelState.unresolvedChannel.ability.guid === event.ability.guid) {
        // this is a hardcast finishing
        endCurrentChannel(event, channelState);
      } else {
        // this is an unresolved channel and it doesn't match this cast,
        // meaning this is an instant cast interrupting an ongoing hardcast
        cancelCurrentChannel(event, channelState);
      }
    }
  }
}

export default Channeling;

/**
 * Returns true iff this event is a 'real cast' - meaning it's not on our list of fake casts.
 * Several things like trinket procs and boss mechanics will show up as cast events
 * even though they don't interact with the cast process at all. These are "fake" casts,
 * and for the purpose of channel tracking we need to ignore them.
 */
export function isRealCast(event: CastEvent) {
  return CASTS_THAT_ARENT_CASTS.includes(event.ability.guid);
}

/** Updates the ChannelState with a BeginChannelEvent */
export function beginCurrentChannel(event: BeginCastEvent | CastEvent, channelState: ChannelState) {
  const beginChannel: BeginChannelEvent = {
    type: EventType.BeginChannel,
    ability: event.ability,
    timestamp: event.timestamp,
    sourceID: event.sourceID,
    isCancelled: false,
    trigger: event,
  };
  channelState.newEvents.push(beginChannel);
  channelState.unresolvedChannel = beginChannel;
}

/** Updates the ChannelState with a EndChannelEvent tied to the current channel */
export function endCurrentChannel(event: AnyEvent, channelState: ChannelState) {
  if (!channelState.unresolvedChannel) {
    // TODO log error?
    return;
  }
  const endChannel: EndChannelEvent = {
    type: EventType.EndChannel,
    ability: channelState.unresolvedChannel.ability,
    timestamp: event.timestamp,
    sourceID: channelState.unresolvedChannel.sourceID,
    start: channelState.unresolvedChannel.timestamp,
    duration: event.timestamp - channelState.unresolvedChannel.timestamp,
    beginChannel: channelState.unresolvedChannel,
    trigger: event,
  };
  channelState.newEvents.push(endChannel);
  channelState.unresolvedChannel = null;
}

/**
 * Cancels the current channel (if there is one), and updates the channel state appropriately
 * @param channelState the current channel state
 * @param currentEvent the current event being handled
 */
export function cancelCurrentChannel(currentEvent: AnyEvent, channelState: ChannelState) {
  if (channelState.unresolvedChannel !== null) {
    channelState.unresolvedChannel.isCancelled = true;
    channelState.unresolvedChannel = null;
    // TODO also push a cancel channel event, or just stop using those?
  }
}

/**
 * Helper to create a channel spec handler for the common case of a channeled spell that can be delimited by a buff.
 * These cases involve a channeled spell that produces a Cast and ApplyBuff event (with the same guid)
 * when it starts, and then a RemoveBuff event when it finishes. Some instead put a Debuff on the target, but the
 * principle is the same.
 *
 * This handler works by handling cast events with the given guid, and then scanning forward for the
 * matched removebuff (or removedebuff) event, and then making the pair of beginchannel and endchannel
 * events based on them. We rely on the buff to show early cancellation and won't change the cancel time
 * even if there are other spell casts in the middle, as some channels of this type actually allow
 * some instants to be used during them.
 *
 * @param spellId the guid for the tracked Cast and RemoveBuff/RemoveDebuff events.
 */
export function buffChannelSpec(spellId: number): ChannelSpec {
  const guids = [spellId];
  const handler: ChannelHandler = (
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    state: ChannelState,
  ) => {
    if (event.type === EventType.Cast) {
      // do standard start channel stuff
      cancelCurrentChannel(event, state);
      beginCurrentChannel(event, state);
      // now scan ahead for the matched removebuff and end the channel at it
      for (let idx = eventIndex + 1; idx < events.length; idx += 1) {
        const laterEvent = events[idx];
        if (
          HasAbility(laterEvent) &&
          laterEvent.ability.guid === spellId &&
          (laterEvent.type === EventType.RemoveBuff || laterEvent.type === EventType.RemoveDebuff)
        ) {
          endCurrentChannel(laterEvent, state);
          break;
        }
      }
    }
  };
  return {
    handler,
    guids,
  };
}

/**
 * Helper to create a channel spec handler for a channeled spell that has no clear delimiters in the events.
 * These cases involve a channeled spell that produces a Cast event when it starts, but provides no
 * indication in events when it finishes.
 *
 * This handler works by assuming the spell is channeled until the next cast.
 * We handle cast events with the given guid, and then scan forward for another cast or begincast to
 * make the endchannel.
 *
 * TODO this handling involves guesswork and can obviously be very wrong if the player doesn't
 *      quickly follow the channel with another cast - should there be a max duration?
 *
 * @param spellId the guid for the tracked Cast events
 */
export function nextCastChannelSpec(spellId: number): ChannelSpec {
  const guids = [spellId];
  const handler: ChannelHandler = (
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    state: ChannelState,
  ) => {
    if (event.type === EventType.Cast) {
      // do standard start channel stuff
      cancelCurrentChannel(event, state);
      beginCurrentChannel(event, state);
      // now scan ahead for another cast or begincast and end the channel at it
      for (let idx = eventIndex + 1; idx < events.length; idx += 1) {
        const laterEvent = events[idx];
        if (
          laterEvent.type === EventType.BeginCast ||
          (laterEvent.type === EventType.Cast && isRealCast(laterEvent))
        ) {
          endCurrentChannel(laterEvent, state);
          break;
        }
      }
    }
  };
  return {
    handler,
    guids,
  };
}

/** Specification of special handling for a spell */
export type ChannelSpec = {
  /** The handling function for this spell */
  handler: ChannelHandler;
  /** The guid or guids of the spells to handle */
  guids: number[];
};

/**
 * A handling function for a channel. Given an applicable event, this function should appropriately
 * handle the event by updating the channel state as required. Keep in mind that this function will
 * be called *instead of* the default handling code for any events that trigger it. */
export type ChannelHandler = (
  /** The event to handle */
  event: AnyEvent,
  /** All events in the encounter */
  events: AnyEvent[],
  /** The event to handle's index */
  eventIndex: number,
  /** The channel state, to be updated depending on handling */
  state: ChannelState,
) => void;

/** A state holder during channel handling, to be updated */
export type ChannelState = {
  /** The current 'unresolved' channel. This represents a spell that has been started but isn't yet finished
   * and we're not sure when or if it will be finished. Depending on follow on events, it could be finished or cancelled.
   */
  unresolvedChannel: BeginChannelEvent | null;
  /** New fabricated channel events to add. Handlers should push to this list. */
  newEvents: AnyEvent[];
};

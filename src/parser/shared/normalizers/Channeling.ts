import SPELLS from 'common/SPELLS';
import CLASSIC_SPELLS from 'common/SPELLS/classic';
import { TALENTS_MAGE, TALENTS_MONK } from 'common/TALENTS';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import {
  AnyEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EmpowerStartEvent,
  EndChannelEvent,
  EventType,
  HasAbility,
  HasSource,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import InsertableEventsWrapper from 'parser/core/InsertableEventsWrapper';
import { Options } from 'parser/core/Module';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { playerInfo } from '../metrics/apl/conditions/test-tools';

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
class Channeling extends EventsNormalizer {
  /**
   * Listing of all special case handlers for channels
   */
  static CHANNEL_SPECS: ChannelSpec[] = [
    // General
    // Shadowlands Encounter
    buffChannelSpec(SPELLS.SOUL_INFUSION.id), // fight channel from Sun King's Salvation - see in this log: https://wowanalyzer.com/report/g4Pja6pLHnmQtbvk/32-Normal+Sun+King's+Salvation+-+Kill+(10:14)/Pjurbo/standard/events
    // Mage
    buffChannelSpec(TALENTS_MAGE.EVOCATION_TALENT.id),
    buffChannelSpec(TALENTS_MAGE.SHIFTING_POWER_TALENT.id),
    nextCastChannelSpec(TALENTS_MAGE.ARCANE_MISSILES_TALENT.id),
    // Priest
    buffChannelSpec(TALENTS_PRIEST.DIVINE_HYMN_TALENT.id),
    nextCastChannelSpec(SPELLS.PENANCE_CAST.id),
    buffChannelSpec(SPELLS.MIND_FLAY.id), // TODO double check ID
    buffChannelSpec(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE.id), // TODO double check ID
    buffChannelSpec(TALENTS_PRIEST.VOID_TORRENT_TALENT.id), // TODO double check ID
    // Evoker
    empowerChannelSpec(SPELLS.FIRE_BREATH.id),
    empowerChannelSpec(SPELLS.FIRE_BREATH_FONT.id),
    empowerChannelSpec(SPELLS.ETERNITY_SURGE.id),
    empowerChannelSpec(SPELLS.ETERNITY_SURGE_FONT.id),
    buffChannelSpec(SPELLS.DISINTEGRATE.id),
    // Rogue
    // Druid
    buffChannelSpec(SPELLS.CONVOKE_SPIRITS.id),
    // Monk
    buffChannelSpec(TALENTS_MONK.ZEN_MEDITATION_TALENT.id),
    buffChannelSpec(TALENTS_MONK.ESSENCE_FONT_TALENT.id),
    buffChannelSpec(TALENTS_MONK.SOOTHING_MIST_TALENT.id),
    buffChannelSpec(SPELLS.CRACKLING_JADE_LIGHTNING.id),
    // Demon Hunter
    buffChannelSpec(TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id), // TODO special handling because of the two buffs?
    // Shaman
    // Hunter
    buffChannelSpec(SPELLS.RAPID_FIRE.id),
    // Paladin
    buffChannelSpec(SPELLS.BLADESTORM.id),

    // CLASSIC
    // Warlock
    buffChannelSpec(CLASSIC_SPELLS.DRAIN_SOUL.id),
    buffChannelSpec(CLASSIC_SPELLS.DRAIN_LIFE.id),
    buffChannelSpec(CLASSIC_SPELLS.DRAIN_MANA.id),
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
    const eventsInserter: InsertableEventsWrapper = new InsertableEventsWrapper(events);

    const channelState: ChannelState = {
      unresolvedChannel: null,
      eventsInserter,
    };

    // for each event, check if there is a special case handler for that GUID -
    // if so - call the handler, if not - call the default handling
    events.forEach((event: AnyEvent, index: number) => {
      if (!HasSource(event) || event.sourceID !== this.selectedCombatant.id) {
        return; // only concerned with events coming from selected player
      }
      const handler = HasAbility(event) ? this.channelSpecMap[event.ability.guid] : undefined;
      if (handler) {
        handler(event, events, index, channelState);
      } else {
        this.defaultHandler(event, events, index, channelState);
      }
    });

    return eventsInserter.build();
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
      if (
        isRealCast(event) &&
        channelState.unresolvedChannel &&
        channelState.unresolvedChannel.ability.guid === event.ability.guid
      ) {
        // this is the current hardcast finishing
        endCurrentChannel(event, channelState);
      }
      // if we had a begincast with another ID and then a cast with a different ID,
      // *usually* that means the first cast was just cancelled, but some instants can be cast while
      // others are casting and we don't want to spuriously mark a cancel.
      // This is why we only mark cancels when a new spell with a cast time is started.
      // This has the possible side effect of missing the last spell to be cancelled in an encounter,
      // as long as all follow on spells are instants.
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
export function isRealCast(event: CastEvent): boolean {
  return !CASTS_THAT_ARENT_CASTS.includes(event.ability.guid);
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
    targetIsFriendly: event.targetIsFriendly,
    sourceIsFriendly: event.sourceIsFriendly,
    targetID: event.target?.id,
  };
  channelState.eventsInserter.addAfterEvent(beginChannel, event);
  channelState.unresolvedChannel = beginChannel;
}

/** Updates the ChannelState with a BeginChannelEvent */
export function beginEmpowerCurrentChannel(event: EmpowerStartEvent, channelState: ChannelState) {
  const beginChannel: BeginChannelEvent = {
    type: EventType.BeginChannel,
    ability: event.ability,
    timestamp: event.timestamp,
    sourceID: event.sourceID,
    isCancelled: false,
    trigger: event,
    targetIsFriendly: event.targetIsFriendly,
    sourceIsFriendly: event.sourceIsFriendly,
    targetID: event.target?.id,
  };
  channelState.eventsInserter.addAfterEvent(beginChannel, event);
  channelState.unresolvedChannel = beginChannel;
}

function copyTargetData(target: ChannelState['unresolvedChannel'], source: AnyEvent) {
  if (source.type === EventType.Cast && target?.ability.guid === source.ability.guid) {
    target.targetID = source.targetID;
    target.targetInstance = source.targetInstance;
    target.targetIsFriendly = source.targetIsFriendly;
  }
}

/** Updates the ChannelState with a EndChannelEvent tied to the current channel */
export function endCurrentChannel(event: AnyEvent, channelState: ChannelState) {
  if (!channelState.unresolvedChannel) {
    // TODO log error?
    return;
  }
  copyTargetData(channelState.unresolvedChannel, event);
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
  channelState.eventsInserter.addAfterEvent(endChannel, event);
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
 * Helper to create a channel spec handler for Evokers empowered spells.
 *
 * This handler works by handling EmpowerStart events with the given guid, and then scanning forward for the
 * matched EmpowerEnd, and then making the pair of beginchannel and endchannel events based on them.
 * Sometimes Empowers don't produce EmpowerEnd, mainly when cancelling the spell. To account for this
 * we will also cancel the channel on next cast or begincast
 *
 * Tipped Empowers don't produce a EmpowerStart event so we use this event to filter those out.
 *
 * @param spellId the guid for the tracked Cast and EmpowerStart/EmpowerEnd events.
 */
export function empowerChannelSpec(spellId: number): ChannelSpec {
  const guids = [spellId];
  const handler: ChannelHandler = (
    event: AnyEvent,
    events: AnyEvent[],
    eventIndex: number,
    state: ChannelState,
  ) => {
    if (event.type === EventType.EmpowerStart || event.type === EventType.Cast) {
      // do standard start channel stuff
      cancelCurrentChannel(event, state);
      if (event.type === EventType.EmpowerStart) {
        beginEmpowerCurrentChannel(event, state);
      }
      // now scan ahead for the matched empowerend, cast or begincast and end the channel at it
      for (let idx = eventIndex + 1; idx < events.length; idx += 1) {
        const laterEvent = events[idx];
        if (
          HasAbility(laterEvent) &&
          laterEvent.ability.guid === spellId &&
          laterEvent.type === EventType.EmpowerEnd
        ) {
          endCurrentChannel(laterEvent, state);
          break;
        } else if (
          laterEvent.type === EventType.BeginCast ||
          (laterEvent.type === EventType.Cast &&
            isRealCast(laterEvent) &&
            laterEvent.timestamp > event.timestamp &&
            event.sourceID === playerInfo.combatant.id)
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
  /** Inserter for new events */
  eventsInserter: InsertableEventsWrapper;
};

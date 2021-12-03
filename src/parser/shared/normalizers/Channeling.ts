import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Ability, AnyEvent, ApplyBuffEvent, BeginCastEvent, BeginChannelEvent, CastEvent, EndChannelEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import { insertEvents } from 'parser/core/insertEvents';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

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
 * and an EndChannel for the finish.
 *
 * Channelled spells are handled inconsistently in the events - they often appear as a Cast event
 * for each channeled tick, but it can vary based on spell. This normalizer contains special case
 * handling to try and place a BeginChannel at the beginning of the channel and an EndChannel at
 * the end.
 */
class Channeling extends EventsNormalizer {

  // registered special case handlers
  buffChannelSpecs: BuffChannelSpec[] = [];

  normalize(events: AnyEvent[]) {
    const channelState: ChannelState = {
      currentChannel: null,
      newEvents: [],
    }
    events.forEach((event) => {
      if (event.type === EventType.BeginCast) {
        this.onBeginCast(event, channelState);
      } else if (event.type === EventType.Cast) {
        this.onCast(event, channelState);
      } else if (event.type === EventType.ApplyBuff) {
        // FIXME should be fine from any source because we'll only get the selected player's, but still a bit risky?
        this.onApplyBuff(event, channelState);
      } else if (event.type === EventType.RemoveBuff) {
        // FIXME should be fine from any source because we'll only get the selected player's, but still a bit risky?
        this.onRemoveBuff(event, channelState);
      }
      // TODO special casing
    });

    return insertEvents(events, channelState.newEvents);
  }

  onBeginCast(event: BeginCastEvent, channelState: ChannelState) {
    this.cancelChannel(channelState);
    this.beginChannelFromEvent(event, channelState);
  }

  onCast(event: CastEvent, channelState: ChannelState) {
    if (CASTS_THAT_ARENT_CASTS.includes(event.ability.guid)) {
      // Some things such as boss mechanics are marked as cast-events even though they're usually just "ticks".
      // This can even occur while channeling. We need to ignore them or it will throw off this module.
      return;
    }
    if (this.buffChannelSpecs.find(bcs => bcs.castAbility.guid === event.ability.guid)) {
      // This cast is a channel that will be delineated by the application of a buff,
      // and so we need to ignore the cast event for the purposes of this module.
      return;
    }

    // TODO account for pre-pull begincast
    if (!channelState.currentChannel) {
      // no current channel, meaning this is an instant and it interrupted nothing
      return;
    } else if (channelState.currentChannel.ability.guid === event.ability.guid) {
      // we just finished casting the current channel
      this.endChannel(event.timestamp, channelState);
    } else {
      // we interrupted the current channel with an instant
      this.cancelChannel(channelState);
    }
  }

  onApplyBuff(event: ApplyBuffEvent, channelState: ChannelState) {
    const buffChannelSpec = this.buffChannelSpecs.find(bcs => bcs.buffId === event.ability.guid);
    if (buffChannelSpec) {
      this.beginChannel(event.timestamp, buffChannelSpec.castAbility, event.sourceID!, false, channelState);
    }
  }

  onRemoveBuff(event: RemoveBuffEvent, channelState: ChannelState) {
    const buffChannelSpec = this.buffChannelSpecs.find(bcs => bcs.buffId === event.ability.guid);
    if (buffChannelSpec) {
      this.endChannel(event.timestamp, channelState);
    }
  }

  /** Handles cancellation of the current channel (if there is one) */
  // FIXME this modifies state weirdly
  cancelChannel(channelState: ChannelState) {
    if (channelState.currentChannel) {
      channelState.currentChannel.isCancelled = true;
      channelState.currentChannel = null;
    }
  }


  /** Updates the ChannelState with a BeginChannelEvent */
  beginChannelFromEvent(event: BeginCastEvent, channelState: ChannelState) {
    this.beginChannel(event.timestamp, event.ability, event.sourceID, event.isCancelled, channelState);
  }

  /** Updates the ChannelState with a BeginChannelEvent */
  beginChannel(timestamp: number, ability: Ability, sourceID: number, isCancelled: boolean = false, channelState: ChannelState) {
    const beginChannel: BeginChannelEvent = {
      type: EventType.BeginChannel,
      ability,
      timestamp,
      sourceID,
      isCancelled,
    };
    channelState.newEvents.push(beginChannel);
    channelState.currentChannel = beginChannel;
  }

  /** Updates the ChannelState with a EndChannelEvent tied to the current channel */
  endChannel(timestamp: number, channelState: ChannelState) {
    if (!channelState.currentChannel) {
      // TODO log error?
      return;
    }
    const endChannel: EndChannelEvent = {
      type: EventType.EndChannel,
      ability: channelState.currentChannel.ability,
      timestamp,
      sourceID: channelState.currentChannel.sourceID,
      start: channelState.currentChannel.timestamp,
      duration: timestamp - channelState.currentChannel.timestamp,
      beginChannel: channelState.currentChannel,
    };
    channelState.newEvents.push(endChannel);
    channelState.currentChannel = null;
  }

}

// TODO docs
export type ChannelState = {
  currentChannel: BeginChannelEvent | null;
  newEvents: AnyEvent[];
};

/**
 * Specification for a channel that we detect using a buff on the player (a common special case).
 * These channels typically have a Cast event at the start, sometimes but not always have an
 * additional Cast event for each tick, and their channel time can instead be delineated by the
 * application of a buff on the channeling player.
 */
export type BuffChannelSpec = {
  /**
   * ID of the buff that indicates this spell is being channeled.
   * BeginChannel will be time matched with the ApplyBuff and EndChannel with the RemoveBuff.
   */
  buffId: number,
  /**
   * Ability of the cast event for this channel. This Ability will be used in the BeginChannel and EndChannel
   * events, and actual cast events with this ID will be ignored by this normalizer.
   */
  castAbility: Ability,
}

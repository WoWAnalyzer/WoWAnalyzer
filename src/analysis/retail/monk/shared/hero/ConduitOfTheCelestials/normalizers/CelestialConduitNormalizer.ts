import { TALENTS_MONK } from 'common/TALENTS';
import { AnyEvent, BeginChannelEvent, EndChannelEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;

/*
 * Celestial Conduit is only logging the initial cast and heal/damage events.
 * We need to track properly as a channel, because the casptone, Unity Within,
 * procs at the end of the channel if not cast before, or if the channel is cancelled.
 */

class CelestialConduitNormalizer extends EventsNormalizer {
  beginChannelFabricated: BeginChannelEvent | undefined;
  endChannelFabricated: EndChannelEvent | undefined;

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event) => {
      if (this.endChannelFabricated) {
        fixedEvents.push(this.endChannelFabricated);
        this.endChannelFabricated = undefined;
      }
      fixedEvents.push(event);
      if (event.type === EventType.ApplyBuff || event.type === EventType.RemoveBuff) {
        if (
          event.type === EventType.ApplyBuff &&
          event.ability.guid === TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id
        ) {
          debug && console.log('Begin channel at ' + this.owner.formatTimestamp(event.timestamp));
          this.beginChannelFabricated = {
            type: EventType.BeginChannel,
            timestamp: event.timestamp,
            ability: {
              abilityIcon: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.icon,
              guid: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
              name: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.name,
              type: 8,
            },
            sourceID: event.sourceID!,
            isCancelled: false,
            sourceIsFriendly: true,
            targetIsFriendly: true,
            __fabricated: true,
          };
        } else if (
          this.beginChannelFabricated &&
          event.type === EventType.RemoveBuff &&
          event.ability.guid === TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id
        ) {
          fixedEvents.push(this.beginChannelFabricated);
          debug && console.log('End Channel at ' + this.owner.formatTimestamp(event.timestamp));
          this.endChannelFabricated = {
            timestamp: event.timestamp,
            type: EventType.EndChannel,
            start: this.beginChannelFabricated.timestamp,
            duration: event.timestamp - this.beginChannelFabricated!.timestamp,
            sourceID: event.sourceID!,
            beginChannel: this.beginChannelFabricated,
            ability: {
              abilityIcon: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.icon,
              guid: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
              name: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.name,
              type: 8,
            },
            __fabricated: true,
          };

          this.beginChannelFabricated = undefined;
        }
      }
    });
    return fixedEvents;
  }
}

export default CelestialConduitNormalizer;

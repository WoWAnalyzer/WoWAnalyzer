import { TALENTS_MONK } from 'common/TALENTS';
import { AnyEvent, BeginChannelEvent, EndChannelEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { CELESTIAL_CONDUIT_MAX_DURATION } from './ConduitOfTheCelestialsEventLinks';
import { CAST_BUFFER_MS } from 'analysis/retail/monk/mistweaver/normalizers/EventLinks/EventLinkConstants';
import SPELLS from 'common/SPELLS';

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

    events.forEach((event, eventIndex) => {
      this.beginChannelFabricated = undefined;
      this.endChannelFabricated = undefined;

      if (
        event.type === EventType.Cast ||
        event.type === EventType.Heal ||
        event.type === EventType.Damage
      ) {
        fixedEvents.push(event);
        if (
          event.type === EventType.Cast &&
          event.ability.guid === TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id
        ) {
          const castTimestamp = event.timestamp;
          debug && console.log('Begin Cast at ' + this.owner.formatTimestamp(castTimestamp));
          this.beginChannelFabricated = {
            type: EventType.BeginChannel,
            timestamp: castTimestamp,
            ability: {
              abilityIcon: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.icon,
              guid: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
              name: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.name,
              type: 8,
            },
            sourceID: event.sourceID,
            isCancelled: false,
            sourceIsFriendly: true,
            targetIsFriendly: true,
            __fabricated: true,
          };
          fixedEvents.push(this.beginChannelFabricated);
          let lastHealDamageEventTimestamp = event.timestamp;
          //look ahead to find the last heal/damage event within 4 seconds
          for (
            let nextEventIndex = eventIndex + 1;
            nextEventIndex < events.length - 1;
            nextEventIndex += 1
          ) {
            const nextEvent = events[nextEventIndex];
            if (
              (nextEvent.type === EventType.Heal &&
                nextEvent.ability.guid === SPELLS.CELESTIAL_CONDUIT_HEAL.id) ||
              (nextEvent.type === EventType.Damage &&
                nextEvent.ability.guid === SPELLS.CELESTIAL_CONDUIT_HEAL.id)
            ) {
              if (
                nextEvent.timestamp - castTimestamp >
                CELESTIAL_CONDUIT_MAX_DURATION + CAST_BUFFER_MS
              ) {
                //we are outside our channel window, move on
                break;
              }
              //mark the event as a possible final event
              lastHealDamageEventTimestamp = nextEvent.timestamp;
              debug &&
                console.log(
                  'Potentail Last Cast at ' +
                    this.owner.formatTimestamp(lastHealDamageEventTimestamp),
                );
            }
          }

          //fabricate event and push
          this.endChannelFabricated = {
            timestamp: lastHealDamageEventTimestamp,
            type: EventType.EndChannel,
            start: castTimestamp,
            duration: lastHealDamageEventTimestamp - castTimestamp,
            sourceID: event.sourceID,
            beginChannel: this.beginChannelFabricated,
            ability: {
              abilityIcon: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.icon,
              guid: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
              name: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.name,
              type: 8,
            },
            __fabricated: true,
          };
          fixedEvents.push(this.endChannelFabricated);
        }
      }
    });
    return fixedEvents;
  }
}

export default CelestialConduitNormalizer;

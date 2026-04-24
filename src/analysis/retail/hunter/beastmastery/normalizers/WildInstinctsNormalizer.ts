import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AddRelatedEvent, AnyEvent, CastEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { WILD_INSTINCTS_TRIGGER } from 'analysis/retail/hunter/beastmastery/normalizers/EventLinkConstants';
import { addAdditionalCastInformation } from 'parser/core/EventMetaLib';

/**
 * Tries to link stomps to barbed shots.
 */
class WildInstinctsNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    if (!this.selectedCombatant.hasTalent(TALENTS.WILD_INSTINCTS_TALENT)) {
      return events;
    }
    const triggeredEvents: CastEvent[] = events.filter((event): event is CastEvent => {
      return (
        event.type === EventType.Cast &&
        (event.ability.guid === SPELLS.STOMP_DAMAGE.id ||
          event.ability.guid === TALENTS.BARBED_SHOT_TALENT.id)
      );
    });

    const grouped = Object.groupBy(triggeredEvents, (event: CastEvent) => event.timestamp);

    Object.values(grouped)
      .filter((triggers): triggers is CastEvent[] => {
        return (
          triggers !== undefined &&
          triggers.length > 1 &&
          triggers.some((e) => e.ability.guid === TALENTS.BARBED_SHOT_TALENT.id) &&
          triggers.some((e) => e.ability.guid === SPELLS.STOMP_DAMAGE.id)
        );
      })
      .forEach((trigger) => {
        const [barbed, stomp] = trigger.reduce<[CastEvent[], CastEvent[]]>(
          ([barbed, stomp], event) => {
            if (event.ability.guid === TALENTS.BARBED_SHOT_TALENT.id) {
              barbed.push(event);
            } else {
              stomp.push(event);
            }

            return [barbed, stomp];
          },
          [[], []],
        );

        stomp.forEach((event) => {
          AddRelatedEvent(barbed[0], WILD_INSTINCTS_TRIGGER, event);
        });
        addAdditionalCastInformation(barbed[0], 'Wild Instincts free cast');

        (barbed[0] as AnyEvent).type = EventType.FreeCast;
      });

    return events;
  }
}

export default WildInstinctsNormalizer;

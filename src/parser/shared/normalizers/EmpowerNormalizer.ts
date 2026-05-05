import {
  AddRelatedEvent,
  AnyEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  HasAbility,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import Abilities from 'parser/core/modules/Abilities';

export const EMPOWER_CAST = 'EmpoweredCast';
export const EMPOWER_END = 'EmpowerEnd';
const EMPOWER_CANCEL = 'EmpowerCancel';

const EMPOWERED_CAST_BUFFER = 6000;

/** Creates links between cast Events and EmpowerEnd events for Empowers which can then be
 * used to verify whether the cast was finished or cancelled - will also create links between
 * Empower cast that consumed Tip the Scales.
 *
 * Empowers cast with Tip the Scales doesn't produce an EmpowerEnd event, only Cast event
 * so we will also create fabricate the missing EmpowerEnd events.
 *
 * Empowers can be released at empowerment level 0, which actually is a cancelled cast,
 * since the empower doesn't go on cooldown or trigger anything.
 *
 * */
class EmpowerNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    abilities: Abilities,
  };

  private empowers: number[] = [];
  private trackedEmpowers: number[];

  constructor(options: Options) {
    super(options, []);

    // Includes ALL Empowers
    this.empowers = this.owner
      .getModule(Abilities)
      .activeAbilities.filter((a) => a.isEmpower > 0)
      .flatMap((a) => a.spell);

    // Includes only Empowers which don't have the NoAuraLog flag
    this.trackedEmpowers = this.owner
      .getModule(Abilities)
      .activeAbilities.filter((a) => a.isEmpower > 1)
      .flatMap((a) => a.spell);

    this.active = this.empowers.length > 0;
    this.priority = 20; // Ensures this runs before all of the spec specific modules

    this.eventLinks.push(
      {
        linkRelation: EMPOWER_CAST,
        reverseLinkRelation: EMPOWER_END,
        linkingEventId: this.empowers,
        linkingEventType: EventType.EmpowerEnd,
        referencedEventId: this.empowers,
        referencedEventType: EventType.Cast,
        /** We only look backwards from the empowerEnd event to not accidentally add the link to a cancelled cast */
        backwardBufferMs: EMPOWERED_CAST_BUFFER,
        anyTarget: true,
        maximumLinks: 1,
        additionalCondition(linkingEvent, referencedEvent) {
          return (
            (linkingEvent as EmpowerEndEvent).empowermentLevel > 0 &&
            (linkingEvent as EmpowerEndEvent).ability.guid ===
              (referencedEvent as CastEvent).ability.guid
          );
        },
      },
      {
        linkRelation: EMPOWER_CAST,
        reverseLinkRelation: EMPOWER_CANCEL,
        linkingEventId: this.empowers,
        linkingEventType: EventType.EmpowerEnd,
        referencedEventId: this.empowers,
        referencedEventType: EventType.Cast,
        /** We only look backwards from the empowerEnd event to not accidentally add the link to the wrong cancelled cast */
        backwardBufferMs: EMPOWERED_CAST_BUFFER,
        anyTarget: true,
        maximumLinks: 1,
        additionalCondition(linkingEvent, referencedEvent) {
          return (
            (linkingEvent as EmpowerEndEvent).empowermentLevel === 0 &&
            (linkingEvent as EmpowerEndEvent).ability.guid ===
              (referencedEvent as CastEvent).ability.guid
          );
        },
      },
    );
  }

  /** If an empower cast is missing the empowerend then search for the remove buff event until you either find the next cast or the event (Instant Cast Empowers and certain empowers don't produce removeBuff events) */
  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    // Create initial EventLinks that we can then reference later
    const events = super.normalize(rawEvents);

    const fixedEvents: AnyEvent[] = [];
    events.forEach((event, index) => {
      // Exclude
      // - Non-Casts
      // - Non-Empowers
      // - Empowers that don't track anyway
      // - Empowers who already have a EmpowerEnd Event
      if (
        event.type !== EventType.Cast ||
        !this.trackedEmpowers.includes(event.ability.guid) ||
        HasRelatedEvent(event, EMPOWER_END)
      ) {
        fixedEvents.push(event);
        return;
      }

      fixedEvents.push(event); // Push real event

      for (let idx = index + 1; idx < events.length; idx += 1) {
        const laterEvent = events[idx];
        // Filter out TTS casts
        if (
          HasAbility(laterEvent) &&
          laterEvent.ability.guid === event.ability.guid &&
          laterEvent.type === EventType.Cast
        )
          break;
        else if (
          HasAbility(laterEvent) &&
          laterEvent.ability.guid === event.ability.guid &&
          laterEvent.type === EventType.RemoveBuff
        ) {
          const fabricatedEvent: EmpowerEndEvent = {
            ability: event.ability,
            timestamp: laterEvent.timestamp,
            sourceID: event.sourceID,
            sourceIsFriendly: event.sourceIsFriendly,
            targetID: event.targetID,
            targetIsFriendly: event.targetIsFriendly,
            type: EventType.EmpowerEnd,
            empowermentLevel: 0,
            __fabricated: true,
          };

          AddRelatedEvent(event, EMPOWER_CANCEL, fabricatedEvent);
          AddRelatedEvent(fabricatedEvent, EMPOWER_CAST, event);

          fixedEvents.push(fabricatedEvent);
          break;
        }
      }
    });

    return fixedEvents;
  }
}

/** Use this to verify if an Empower was cancelled or finished casting.
 *
 * Returns true if the Empower was instant cast with Tip the Scales or if it has an associated empowerEnd event  */
export function empowerFinishedCasting(event: CastEvent): boolean {
  const endEvent: EmpowerEndEvent | undefined = GetRelatedEvent(event, EMPOWER_END);
  return endEvent !== undefined && endEvent.empowermentLevel > 0;
}

/** Get the associated empowerEnd event for an Empower cast */
export function getEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_END, (e) => e.type === EventType.EmpowerEnd);
}

/** Get the associated empowerEnd event for a cancelled Empower cast */
export function getCancelledEmpowerEndEvent(event: CastEvent): EmpowerEndEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_CANCEL, (e) => e.type === EventType.EmpowerEnd);
}

export function getEmpowerCastEvent(event: EmpowerEndEvent): CastEvent | undefined {
  return GetRelatedEvent(event, EMPOWER_CAST, (e) => e.type === EventType.Cast);
}

export default EmpowerNormalizer;
